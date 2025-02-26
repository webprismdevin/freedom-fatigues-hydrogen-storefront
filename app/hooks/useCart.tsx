import {useFetcher} from '@remix-run/react';
import {useEffect, useCallback} from 'react';
import type {Cart as CartType} from '@shopify/hydrogen/storefront-api-types';

/**
 * A hook that provides access to cart data with caching.
 * This hook centralizes cart data fetching and ensures we don't refetch unnecessarily.
 */
export function useCart() {
  const fetcher = useFetcher<{cart: CartType}>();
  
  const fetchCart = useCallback(() => {
    if (!fetcher.data && fetcher.state !== 'loading') {
      fetcher.load('/cart');
    }
  }, [fetcher]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart: fetcher.data?.cart,
    isLoading: fetcher.state === 'loading',
    fetchCart,
  };
} 