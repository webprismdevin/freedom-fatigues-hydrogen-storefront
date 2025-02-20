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
    const formInputs = CartForm.getFormInput(fetcher.formData!);
    const isRedoAction = formInputs.action === CartForm.ACTIONS.LinesAdd && 
      formInputs.inputs?.lines?.some((line: any) => 
        line.attributes?.some((attr: any) => 
          attr.key === 'redo_opted_in_from_cart' && attr.value === 'true'
        )
      );

    return {
      ...fetcher,
      isRedoAction
    };
  });
}
