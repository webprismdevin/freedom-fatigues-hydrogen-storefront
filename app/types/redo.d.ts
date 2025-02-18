declare module '@redotech/redo-hydrogen' {
  import type {ReactNode} from 'react';
  import type {Cart} from '@shopify/hydrogen/storefront-api-types';

  export interface RedoCoverageClient {
    loading(): boolean;
    disable(): Promise<void>;
    enable(): Promise<void>;
    enabled: boolean;
    price: number;
    cartProduct: any;
    cartAttribute: any;
  }

  export function useRedoCoverageClient(): RedoCoverageClient;

  export function RedoProvider(props: {
    cart: Cart;
    storeId: string;
    children?: ReactNode;
  }): JSX.Element;

  export function RedoCheckoutButtons(props: {
    onClick?: (enabled: boolean) => void;
    storeId: string;
    cart: Cart;
    children?: ReactNode;
  }): JSX.Element;

  export const REDO_REQUIRED_HOSTNAMES: string[];
} 