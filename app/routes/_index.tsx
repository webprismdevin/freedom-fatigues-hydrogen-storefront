import {Hero} from '../components/Hero';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {ProductSwimlane, Section} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import type {
  CollectionConnection,
  Metafield,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {HERO_FRAGMENT, MODULE_FRAGMENT, sanity} from '~/lib/sanity';
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

export async function loader({params, context}: LoaderFunctionArgs) {
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
    variables: {handle: 'best-sellers'},
  });

  return defer({
    shop,
    hero,
    modules,
    featuredProducts: context.storefront.query<{collection: CollectionConnection;}>(
      HOMEPAGE_FEATURED_PRODUCTS_QUERY,
      {
        variables: {handle: 'best-sellers'},
      },
    ),
    newlyReleased: context.storefront.query<{collection: CollectionConnection}>(
      HOMEPAGE_SALE_PRODUCTS_QUERY,
      {
        variables: {handle: 'newly-released'},
      },
    ),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export type PageModule = any;

export default function Homepage() {
  const {hero, modules, featuredProducts, newlyReleased} =
    useLoaderData<typeof loader>();

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <div className="bg-primary text-contrast">
      <Hero data={hero.hero} />

      <Suspense fallback={<ProductSwimlaneLoading />}>
        <Await resolve={featuredProducts}>
          {({collection}) => {
            if (!collection?.products?.nodes) return null;
            return (
              <ProductSwimlane
                products={collection?.products.nodes}
                title="Best Sellers"
                count={4}
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense>
        <Await resolve={modules}>
          <Modules modules={modules.modules} />
        </Await>
      </Suspense>

      <Suspense fallback={<ProductSwimlaneLoading />}>
        <Await resolve={newlyReleased}>
          {({collection}) => {
            if (!collection?.products?.nodes) return null;
            return (
              <ProductSwimlane
                products={collection.products?.nodes}
                title="Latest Releases"
                count={4}
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function ProductSwimlaneLoading() {
  return (
    <Section padding="y">
      <div className="grid h-[200px] w-full animate-pulse grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-full rounded bg-primary/10" />
        ))}
      </div>
    </Section>
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
  query homepageFeaturedProducts($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 8, sortKey: COLLECTION_DEFAULT) {
        nodes {
          ...ProductCard
        }
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
      products(first: 8, sortKey: COLLECTION_DEFAULT) {
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
