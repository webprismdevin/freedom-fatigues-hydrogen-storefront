import {useEffect} from 'react';
import {useCartFetchers} from './useCartFetchers';
import {CartForm} from '@shopify/hydrogen';

export function useDrawerCart({
  isOpen,
  openDrawer,
}: {
  isOpen: boolean;
  openDrawer: () => void;
}) {
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  useEffect(() => {
    if (isOpen || !addToCartFetchers.length) return;

    // Only open drawer for non-Redo cart actions
    const hasNonRedoAction = addToCartFetchers.some(fetcher => !fetcher.isRedoAction);
    if (hasNonRedoAction) {
      openDrawer();
    }
  }, [addToCartFetchers, isOpen, openDrawer]);
} 