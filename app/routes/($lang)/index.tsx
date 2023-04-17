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
import {CTA_FRAGMENT, HERO_FRAGMENT, sanity} from '~/lib/sanity';
import ShippingAndReturns from '~/components/ShippingAndReturns';
import SlideShow from '~/components/Slideshow';
import Marquee from '~/components/Marquee';
import ReviewCarousel from '~/components/ReviewCarousel';

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

  const home = await sanity.fetch(`
  *[_type == "home"][0]{
    ...,
    hero {
      ${HERO_FRAGMENT}
    },
    "modules": modules[]{
      ...,
      _type,
      (_type == 'component.swimlane') => {
          "gid": collection->store.gid,
          "to": "/collections/" + collection->store.slug.current,
          "handle": collection->store.slug.current,
      },
      (_type == 'component.hero') => {
        ${HERO_FRAGMENT}
      },
      (_type == 'component.slides') => {
        ...,
        slides[]{
          ...,
          ${CTA_FRAGMENT},
          image {
            ...,
            "height": asset-> metadata.dimensions.height,
            "width": asset-> metadata.dimensions.width
          },
          image2 {
            ...,
            "height": asset-> metadata.dimensions.height,
            "width": asset-> metadata.dimensions.width
          }
        }
      },
      (_type == 'component.collectionGrid') => {
        ...,
        collections[]{
          ...,
          "to":'/collections/' + collection->store.slug.current
        }
      }
    },
  }
`);

  const {shop} = await context.storefront.query<{
    shop: HomeSeoData;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'new-releases'},
  });

  return defer({
    shop,
    home,
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

const moduleSwitch = (module: PageModule) => {
  switch (module._type) {
    case 'component.textWithImage':
      return <TextWithImage data={module} />;
    case 'component.hero':
      return <Hero data={module} />;
    case 'component.collectionGrid':
      return <CollectionGrid data={module} />;
    case 'component.shippingAndReturns':
      return <ShippingAndReturns data={module} />;
    case 'component.marquee':
      return <Marquee data={module} />;
    case 'component.reviewCarousel':
      return <ReviewCarousel data={module} />;
    case 'component.slides':
      return <SlideShow data={module} />;
    // case 'component.swimlane':
    //   return <div>Swimlane</div>;
    default:
      return null;
  }
};

export default function Homepage() {
  const {home, featuredProducts, saleProducts} = useLoaderData<typeof loader>();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  const {hero} = home;

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <div className="mt-[-3rem] bg-primary text-contrast md:mt-[-96px]">
      <Hero data={hero} />

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

      {home.modules.map((module: PageModule) => moduleSwitch(module))}

      {/* <ShippingAndReturns />

      <SlideShow slides={slidesData} />

      <Marquee />

      {/* <Hero
        image={{
          url: 'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Group_Shot2.jpg?v=1680878761',
          alt: '',
        }}
        caption={'Hand-Stitched Hats Built In America'}
        title={'American Craftsmanship'}
        cta={{text: 'Shop Hats', to: '/collections/hats'}}
      /> */}

      {/* <CollectionGrid />

      <ReviewCarousel /> */}

      {/* <Hero
        image={{
          url: 'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Homepage_Header_78120f68-52e2-4634-bc3f-a68f52fd814e.png?v=1678676481',
          alt: '',
        }}
        caption={'Hand-Stitched Hats Built In America'}
        title={'American Craftsmanship'}
        cta={{text: 'Shop Hats', to: '/collections/hats'}}
      /> */}

      {/* <TextWithImage /> */}

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
