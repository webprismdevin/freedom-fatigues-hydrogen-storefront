import {useFetchers} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';

export function useCartFetchers(actionType?: string) {
  const fetchers = useFetchers();

  return fetchers.filter(fetcher => {
    const formData = fetcher.formData;
    if (!formData) return false;

    const formInputs = CartForm.getFormInput(formData);
    if (!formInputs.action) return false;

    // If we have an action type, only return fetchers with that action
    if (actionType && actionType !== formInputs.action) return false;

    return true;
  }).map(fetcher => {
    return fetcher;
  });
}
