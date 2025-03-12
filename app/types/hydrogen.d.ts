// Type declarations for Hydrogen 2025.1.2

declare module '@shopify/hydrogen' {
  // Re-export types that might be missing
  export interface HydrogenCart {
    get(): Promise<{
      cart?: any;
      errors?: any[];
      userErrors?: any[];
    } | null>;
    addLines(lines: any): Promise<any>;
    updateLines(lines: any): Promise<any>;
    removeLines(lineIds: any): Promise<any>;
    updateDiscountCodes(discountCodes: any): Promise<any>;
    updateBuyerIdentity(buyerIdentity: any): Promise<any>;
    updateAttributes(attributes: any): Promise<any>;
    setCartId(cartId: string): Headers;
  }

  export interface CartLineInput {
    merchandiseId: string;
    quantity: number;
    selectedVariant?: any;
    [key: string]: any;
  }

  export const CartForm: {
    ACTIONS: {
      LinesAdd: string;
      LinesUpdate: string;
      LinesRemove: string;
      DiscountCodesUpdate: string;
      BuyerIdentityUpdate: string;
      AttributesUpdateInput: string;
    };
    getFormInput(formData: FormData): {
      action: string;
      inputs: any;
    };
  };

  export function flattenConnection<T>(connection: any): T[];
  export function createContentSecurityPolicy(options: any): {
    nonce: string;
    header: string;
    NonceProvider: React.ComponentType<any>;
  };

  export const AnalyticsPageType: {
    product: string;
    collection: string;
    home: string;
    page: string;
    search: string;
    cart: string;
    checkout: string;
    notFound: string;
  };

  export interface ShopifyAnalyticsProduct {
    productGid: string;
    variantGid: string;
    name: string;
    variantName: string;
    brand: string;
    price: string;
    quantity?: number;
  }

  export interface SeoConfig<T = any> {
    title?: string;
    description?: string;
    media?: any;
    jsonLd?: any;
    [key: string]: any;
  }

  export type SeoHandleFunction<T = any> = (props: { data: T }) => SeoConfig;

  export function useOptimisticVariant(selectedVariant: any, variants: any[]): any;
  export function Money(props: any): JSX.Element;
  export function Image(props: any): JSX.Element;
  export function ShopPayButton(props: any): JSX.Element;
  
  // Remix Oxygen types
  export type LoaderFunctionArgs = {
    request: Request;
    context: any;
    params: Record<string, string>;
  };
  
  export type ActionFunctionArgs = {
    request: Request;
    context: any;
    params: Record<string, string>;
  };
  
  export type AppLoadContext = Record<string, any>;
  
  export type HeadersFunction = (args: { 
    loaderHeaders?: Headers; 
    parentHeaders?: Headers;
    actionHeaders?: Headers;
  }) => HeadersInit;
  
  export function json<T>(data: T, init?: ResponseInit): Response;
}

declare module '@remix-run/react' {
  export function Await<T>(props: {
    children: (data: T) => React.ReactNode;
    resolve: Promise<T> | T;
    errorElement?: React.ReactNode;
  }): JSX.Element;

  export function useLoaderData<T = any>(): T;
  export function useMatches(): any[];
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
  export function useLocation(): { pathname: string; search: string; hash: string; state: any };
  export function useFetcher<T = any>(): {
    data?: T;
    state: 'idle' | 'submitting' | 'loading';
    Form: React.ComponentType<any>;
    submit: (formData: FormData, options?: any) => void;
    load: (href: string) => void;
  };
  export function useNavigation(): {
    state: 'idle' | 'submitting' | 'loading';
    location?: { pathname: string; search: string };
    formData?: FormData;
    formAction?: string;
    formMethod?: string;
  };
  export function useParams(): Record<string, string | undefined>;
  export function RemixServer(props: any): JSX.Element;
  
  export interface RemixLinkProps {
    unstable_viewTransition?: boolean | undefined;
  }
}

declare module '@shopify/remix-oxygen' {
  export type LoaderFunctionArgs = {
    request: Request;
    context: any;
    params: Record<string, string>;
  };
  
  export type ActionFunctionArgs = {
    request: Request;
    context: any;
    params: Record<string, string>;
  };
  
  export type AppLoadContext = Record<string, any>;
  
  export type HeadersFunction = (args: { 
    loaderHeaders?: Headers; 
    parentHeaders?: Headers;
    actionHeaders?: Headers;
  }) => HeadersInit;
  
  export function json<T>(data: T, init?: ResponseInit): Response;
}

declare module '@shopify/hydrogen/storefront-api-types' {
  export interface Product {
    id?: string;
    title?: string;
    handle?: string;
    vendor?: string;
    description?: string;
    descriptionHtml?: string;
    options?: any[];
    selectedVariant?: any;
    variants?: any;
    media?: any;
    seo?: {
      title?: string;
      description?: string;
    };
    tags?: string[];
    availableForSale?: boolean;
    productType?: string;
    url?: string;
    shipping_dropdown_override?: any;
    size_chart?: any;
  }

  export interface ProductVariant {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions?: {
      name: string;
      value: string;
    }[];
    image?: {
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    } | null;
    availableForSale?: boolean;
    quantityAvailable?: number;
    sku?: string;
    product?: {
      title: string;
      handle: string;
    };
  }

  export interface Shop {
    name?: string;
    shippingPolicy?: {
      body?: string;
      handle?: string;
    };
    refundPolicy?: {
      body?: string;
      handle?: string;
    };
  }

  export interface ProductConnection {
    nodes: Product[];
  }

  export interface MediaConnection {
    nodes: any[];
  }

  export interface MediaImage {
    mediaContentType: string;
    image: {
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    };
  }

  export interface Metafield {
    value: string;
    reference?: any;
  }

  export interface SelectedOptionInput {
    name: string;
    value: string;
  }

  export interface Cart {
    id: string;
    lines: {
      edges: any[];
      nodes: any[];
      pageInfo: any;
    };
    cost: {
      totalAmount: {
        amount: string;
        currencyCode: string;
      };
      subtotalAmount: {
        amount: string;
        currencyCode: string;
      };
    };
  }
} 