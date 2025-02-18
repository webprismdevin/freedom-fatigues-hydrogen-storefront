import {useFetchers} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';

export function useCartFetchers(actionType?: string) {
  const fetchers = useFetchers();

  const cartFetchers = [];
  for (const fetcher of fetchers) {
    const formData = fetcher.formData;
    if (!formData) continue;

    const formInputs = CartForm.getFormInput(formData);
    if (!formInputs.action) continue;

    // If we have an action type, only return fetchers with that action
    if (actionType && actionType !== formInputs.action) continue;

    cartFetchers.push(fetcher);
  }

  return cartFetchers;
}
