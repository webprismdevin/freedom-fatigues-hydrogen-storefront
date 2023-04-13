import {GodFamilyCountry} from './../../components/GodFamilyCountry';
import {HeroParallax} from './../../components/HeroParallax';
import {CollectionGrid} from '../../components/CollectionGrid';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  Button,
  Link,
} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import type {
  CollectionConnection,
  Metafield,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {sanity} from '~/lib/sanity';
import HomeHero from '~/components/HomeHero';
import ShippingAndReturns from '~/components/ShippingAndReturns';
import SlideShow, {slidesData} from '~/components/Slideshow';
import Marquee from '~/components/Marquee';
import ReviewsCarousel from '~/components/ReviewsCarousel';

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

  const {shop, hero} = await context.storefront.query<{
    hero: CollectionHero;
    shop: HomeSeoData;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'new-releases'},
  });

  const sanityHome = await sanity.fetch(`
    *[_type == "home"][0]
  `);

  return defer({
    shop,
    sanityHome,
    // primaryHero: hero,
    primaryHero: null,
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    featuredProducts: context.storefront.query<{
      products: ProductConnection;
    }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {
        /**
         * Country and language properties are automatically injected
         * into all queries. Passing them is unnecessary unless you
         * want to override them from the following default:
         */
        country,
        language,
      },
    }),
    saleProducts: context.storefront.query<{collection: CollectionConnection}>(
      HOMEPAGE_SALE_PRODUCTS_QUERY,
      {
        variables: {handle: 'sale'},
      },
    ),
    featuredCollections: context.storefront.query<{
      collections: CollectionConnection;
    }>(FEATURED_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    }),
    tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
      COLLECTION_HERO_QUERY,
      {
        variables: {
          handle: 'winter-2022',
          country,
          language,
        },
      },
    ),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function Homepage() {
  const {
    sanityHome,
    // primaryHero,
    saleProducts,
    // tertiaryHero,
    // featuredCollections,
    featuredProducts,
  } = useLoaderData<typeof loader>();

  console.log(saleProducts);

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <div className="bg-primary text-contrast">
      <HeroParallax
        image={{
          url: 'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Copy_of_Homepage_Header.png?v=1679025048',
          alt: '',
        }}
        caption={'We are American Made'}
        title={'Unapologetically American-Made'}
        cta={{text: 'Shop Sweatshirts', to: '/collections/sweatshirts'}}
        layout="right"
      />

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              console.log(products);
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

      <ShippingAndReturns />

      <SlideShow slides={slidesData} />

      <Marquee />

      <HeroParallax
        image={{
          url: 'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Group_Shot2.jpg?v=1680878761',
          alt: '',
        }}
        caption={'Hand-Stitched Hats Built In America'}
        title={'American Craftsmanship'}
        cta={{text: 'Shop Hats', to: '/collections/hats'}}
      />

      <CollectionGrid />

      <ReviewsCarousel />

      <HeroParallax
        image={{
          url: 'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Homepage_Header_78120f68-52e2-4634-bc3f-a68f52fd814e.png?v=1678676481',
          alt: '',
        }}
        caption={'Hand-Stitched Hats Built In America'}
        title={'American Craftsmanship'}
        cta={{text: 'Shop Hats', to: '/collections/hats'}}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-1">
        <div className="p-8 lg:p-24">
          <div className="text-center">
            <p className="font-heading text-xl lg:text-8xl">AMERICAN</p>
            <p className="font-heading text-5xl">THROUGH AND THROUGH</p>
          </div>
          <div className="mx-auto mt-4 max-w-[500px]">
            <p className="leading-loose">
              Freedom Fatigues is committed to producing the highest quality
              American-made apparel on the market.
              <br />
              <br />
              We are a conscious American enterprise bent on bringing every
              piece of the apparel manufacturing process back to domestic
              businesses, and American families.
            </p>
            <div className="mt-4">
              <Link to={'/'}>Learn more</Link>
            </div>
          </div>
        </div>
        <div>
          <img
            src={
              'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/mens-patriotic-shirts_d09401ab-5571-414f-8f23-7ed49b2604a6.png?v=1667298623'
            }
            alt=""
          />
        </div>
      </div>

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

      {/* {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )} */}

      {/* {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections.nodes}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )} */}
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
