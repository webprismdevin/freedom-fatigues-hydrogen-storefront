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
  // Exclude Redo cart actions when checking for cart additions
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd, true);

  useEffect(() => {
    if (isOpen || !addToCartFetchers.length) return;

    openDrawer();
  }, [addToCartFetchers, isOpen, openDrawer]);
} 