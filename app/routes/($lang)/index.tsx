import {TextWithImage} from './../../components/TextWithImage';
import {Hero} from '../../components/Hero';
import {CollectionGrid} from '../../components/CollectionGrid';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {ProductSwimlane} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import type {
  CollectionConnection,
  Metafield,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {HERO_FRAGMENT, MODULE_FRAGMENT, sanity} from '~/lib/sanity';
import ShippingAndReturns from '~/components/ShippingAndReturns';
import SlideShow from '~/components/Slideshow';
import Marquee from '~/components/Marquee';
import ReviewCarousel from '~/components/ReviewCarousel';
import Modules from '~/components/Modules';

interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export interface CollectionHero {
  byline: Metafield;
  cta: Metafield;
  handle: string;
  heading: Metafield;
  height?: 'full';
  loading?: 'eager' | 'lazy';
  spread: Metafield;
  spreadSecondary: Metafield;
  top?: boolean;
}

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const hero = await sanity.fetch(`
  *[_type == "home"][0]{
    ...,
    hero {
      ${HERO_FRAGMENT}
    },
  }
`);

  const modules = await sanity.fetch(`
  *[_type == "home"][0]{
    ${MODULE_FRAGMENT}
  }
  `);

  const {shop} = await context.storefront.query<{
    shop: HomeSeoData;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'new-releases'},
  });

  return defer({
    shop,
    hero,
    modules,
    featuredProducts: context.storefront.query<{
      products: ProductConnection;
    }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY),
    saleProducts: context.storefront.query<{collection: CollectionConnection}>(
      HOMEPAGE_SALE_PRODUCTS_QUERY,
      {
        variables: {handle: 'sale'},
      },
    ),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export type PageModule = any;

// const moduleSwitch = (module: PageModule) => {
//   switch (module._type) {
//     case 'component.textWithImage':
//       return <TextWithImage data={module} key={module._key} />;
//     case 'component.hero':
//       return <Hero data={module} key={module._key} />;
//     case 'component.collectionGrid':
//       return <CollectionGrid data={module} key={module._key} />;
//     case 'component.shippingAndReturns':
//       return <ShippingAndReturns data={module} key={module._key} />;
//     case 'component.marquee':
//       return <Marquee data={module} key={module._key} />;
//     case 'component.reviewCarousel':
//       return <ReviewCarousel data={module} key={module._key} />;
//     case 'component.slides':
//       return <SlideShow data={module} key={module._key} />;
//     // case 'component.swimlane':
//     //   return <div>Swimlane</div>;
//     default:
//       return null;
//   }
// };

export default function Homepage() {
  const {hero, modules, featuredProducts, saleProducts} =
    useLoaderData<typeof loader>();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <div className="mt-[-3rem] bg-primary text-contrast md:mt-[-96px]">
      <Hero data={hero.hero} />

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products.nodes}
                  title="New Releases"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {modules && (
        <Suspense>
          <Await resolve={modules}>
            <Modules modules={modules.modules} />
          </Await>
        </Suspense>
      )}

      {saleProducts && (
        <Suspense>
          <Await resolve={saleProducts}>
            {({collection}) => {
              if (!collection?.products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={collection.products?.nodes}
                  title="Soon to be Retired"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
    </div>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
      products(first: 20){
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_SALE_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageSaleProducts($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
