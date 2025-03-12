// Global type declarations

// Declare global window properties
interface Window {
  _aimTrack?: any[];
  fbq?: any;
  dataLayer?: any[];
  _learnq?: any[];
  TriplePixel?: any;
}

// Extend the Remix Link props
declare module '@remix-run/react' {
  interface RemixLinkProps {
    unstable_viewTransition?: boolean | undefined;
  }
}

// Extend the CartLineInput type
declare module '@shopify/hydrogen' {
  interface CartLineInput {
    selectedVariant?: any;
  }
}

// Extend the SeoConfig type
declare module '@shopify/hydrogen' {
  interface SeoConfig<T = any> {}
}

// Extend the root data type
declare module '@remix-run/react' {
  interface RouteMatch {
    data?: {
      cart?: any;
      [key: string]: any;
    };
  }
}

// Extend the Product type
declare module '@shopify/hydrogen/storefront-api-types' {
  interface Product {
    url?: string;
    shipping_dropdown_override?: any;
    size_chart?: any;
  }
}

// Extend the fetcher data type
declare module '@remix-run/react' {
  interface FetcherWithComponents<TData = any> {
    data?: {
      ok?: boolean;
      [key: string]: any;
    };
  }
} 