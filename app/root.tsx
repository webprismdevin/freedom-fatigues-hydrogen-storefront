import {
  defer,
  type LinksFunction,
  type MetaFunction,
  type LoaderFunctionArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Await,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
  isRouteErrorResponse,
  useRouteLoaderData,
} from '@remix-run/react';
import {
  ShopifySalesChannel,
  Seo,
  type SeoHandleFunction,
  Script,
  type HydrogenCart,
} from '@shopify/hydrogen';
import type {Cart as CartType} from '@shopify/hydrogen/storefront-api-types';
import {Layout} from '~/components/Layout';
import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';
import {Suspense} from 'react';

import styles from './styles/app.css';
import favicon from '../public/favicon.png';

import {DEFAULT_LOCALE, useIsHomePath} from './lib/utils';
import invariant from 'tiny-invariant';
import {Shop} from '@shopify/hydrogen/storefront-api-types';
import {useAnalytics} from './hooks/useAnalytics';
import {getSiteSettings} from './lib/sanity';
// analytics
import {CustomScriptsAndAnalytics} from './components/CustomScriptsAndAnalytics';
import {useEffect} from 'react';
import posthog from 'posthog-js';

declare global {
  interface Window {
    fbq: any;
    dataLayer: any;
    TriplePixel: any;
    _learnq: any;
    plausible: any;
    _aimTrack: any;
  }
}

const seo: SeoHandleFunction<typeof loader> = ({data, pathname}) => ({
  title: 'Freedom Fatigues | American Made | Veteran Owned & Operated',
  titleTemplate: '%s',
  description: data?.shop?.shop?.description,
  handle: '@shopify',
  url: `https://www.freedomfatigues.com${pathname}`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data?.shop?.shop?.name,
    url: `https://www.freedomfatigues.com/`,
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
    {
      rel: 'preconnect dns-prefetch',
      href: 'https://triplewhale-pixel.web.app/',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preconnect dns-prefetch',
      href: 'https://api.config-security.com/',
      crossOrigin: 'anonymous',
    },
  ];
};

export const meta: MetaFunction = () => {
  return [
    {charset: 'utf-8'},
    {name: 'viewport', content: 'width=device-width,initial-scale=1'},
  ];
};

type LoaderContext = AppLoadContext & {
  cart: HydrogenCart;
  session: {
    get: (key: string) => Promise<string | undefined>;
  };
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront, session, cart} = context as unknown as LoaderContext;
  const [cartId, shop] = await Promise.all([
    session.get('cartId'),
    getShopData(context),
  ]);

  const settings = await getSiteSettings();

  let cartPromise;
  if (cartId) {
    cartPromise = cart.get();
  } else {
    // Initialize a new cart if one doesn't exist
    cartPromise = cart.create({}).then((result) => {
      const headers = cart.setCartId(result.cart.id);
      // Note: In a real implementation, you'd want to handle these headers
      return result.cart;
    });
  }

  return defer({
    settings,
    shop,
    selectedLocale: storefront.i18n,
    cart: cartPromise,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: shop.shop.id,
    },
    optimisticData: {
      cart: {
        id: cartId,
        totalQuantity: 0,
        lines: [],
        cost: {
          subtotalAmount: {
            amount: '0.0',
            currencyCode: 'USD',
          },
          totalAmount: {
            amount: '0.0',
            currencyCode: 'USD',
          },
        },
      },
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <Document>
      <Layout
        settings={data.settings}
        layout={data.shop as ShopData}
        key={`${data.selectedLocale.language}-${data.selectedLocale.country}`}
        optimisticData={data.optimisticData}
      >
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({children}: {children: React.ReactNode}) {
  const data = useLoaderData<typeof loader>();
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;
  const isHome = useIsHomePath();

  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language}>
      <head>
        <Seo />
        <meta
          name="theme-color"
          content={`${isHome ? '#141414' : '#FFFFFF'}`}
        />
        <Script
          async
          src="https://chat-widget.getredo.com/widget.js?widgetId=sshis2brqgi1wgx"
        />
        <Script
          async
          src="https://cdn.aimerce.ai/a.browser.shopify.hydrogen.umd.js?domain=freedom-fatigues.myshopify.com"
        />
        <Meta />
        <Links />
        {process.env.NODE_ENV == 'development' && (
          <script src="http://localhost:8097"></script>
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <CustomScriptsAndAnalytics />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const [root] = useMatches();
  const data = (root?.data ?? {}) as RootData;
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;

  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>{errorStatus}</h1>
      <h2>{errorMessage}</h2>
    </div>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
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
}

async function getShopData({storefront}: AppLoadContext) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    shop: data.shop,
  };
}

export interface RootData {
  selectedLocale: typeof DEFAULT_LOCALE;
  shop: any;
  settings: any;
  cart: Promise<CartType | null>;
  analytics: {
    shopifySalesChannel: string;
    shopId: string;
  };
}
