import {
  defer,
  type LinksFunction,
  type MetaFunction,
  type LoaderArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Await,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useMatches,
} from '@remix-run/react';
import {
  ShopifySalesChannel,
  Seo,
  type SeoHandleFunction,
} from '@shopify/hydrogen';
import {Layout} from '~/components';
import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';

import styles from './styles/app.css';
import favicon from '../public/favicon.png';

import {DEFAULT_LOCALE, parseMenu, type EnhancedMenu} from './lib/utils';
import invariant from 'tiny-invariant';
import {Shop, Cart} from '@shopify/hydrogen/storefront-api-types';
import {useAnalytics} from './hooks/useAnalytics';
import AnnouncementBar from './components/AnnouncementBar';
import {getSiteSettings, sanity} from './lib/sanity';
import {Suspense} from 'react';

const seo: SeoHandleFunction<typeof loader> = ({data, pathname}) => ({
  title: data?.shop?.shop?.name,
  titleTemplate: '%s',
  description: data?.shop?.shop?.description?.substring(0, 154),
  handle: '@shopify',
  url: `https://freedomfatigues.com${pathname}`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data?.shop?.shop?.name,
    url: `https://freedomfatigues.com/`,
    logo: '/branding/logo_black.png',
    sameAs: [
      'https://www.facebook.com/freedomfatigues',
      'https://www.instagram.com/freedomfatigues/',
    ],
  },
});

export const handle = {
  seo,
};

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://cdn.sanity.io',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
  themeColor: '#141414',
});

export async function loader({context}: LoaderArgs) {
  const [cartId, shop] = await Promise.all([
    context.session.get('cartId'),
    getShopData(context),
  ]);

  // const announcements = await sanity.fetch(`*[ _type == "announcement" ][0]`);
  const settings = await getSiteSettings();

  return defer({
    // announcements,
    settings,
    shop,
    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: shop.shop.id,
    },
  });
}

export default function App() {
  const {settings, shop, selectedLocale} = useLoaderData<typeof loader>();
  const locale = selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language}>
      <head>
        <Seo />
        <Meta />
        <Links />
      </head>
      <body>
        <Suspense fallback={<div className="h-12"></div>}>
          <Await resolve={settings.announcements}>
            <AnnouncementBar
              interval={settings.announcements.interval}
              data={settings.announcements.announcements}
            />
          </Await>
        </Suspense>
        <Layout
          settings={settings}
          layout={shop as ShopData}
          key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const [root] = useMatches();
  const caught = useCatch();
  const isNotFound = caught.status === 404;
  const locale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale.language}>
      <head>
        <title>{isNotFound ? 'Not found' : 'Error'}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          settings={root?.data.settings}
          layout={root?.data?.shop}
          key={`${locale.language}-${locale.country}`}
        >
          {isNotFound ? (
            <NotFound type={caught.data?.pageType} />
          ) : (
            <GenericError
              error={{message: `${caught.status} ${caught.data}`}}
            />
          )}
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale.language}>
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout layout={root?.data?.shop} settings={root?.data.settings}>
          <GenericError error={error} />
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layoutMenus(
    $language: LanguageCode
  ) @inContext(language: $language) {
    shop {
      id
      name
      description
    }
  }
`;

export interface ShopData {
  shop: Shop;
  cart?: Promise<Cart>;
}

async function getShopData({storefront}: AppLoadContext) {
  const data = await storefront.query<ShopData>(LAYOUT_QUERY, {
    variables: {
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    shop: data.shop,
  };
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

export async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
