import {CartLoading, Cart} from '~/components';
import {Await, useMatches, useLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import invariant from 'tiny-invariant';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import type {Cart as CartType} from '@shopify/hydrogen/storefront-api-types';
import {isLocalPath} from '~/lib/utils';
import {CartForm, flattenConnection} from '@shopify/hydrogen';
import type {HydrogenCart} from '@shopify/hydrogen';

type ActionContext = AppLoadContext & {
  cart: HydrogenCart;
  session: {
    get: (key: string) => Promise<string | undefined>;
  };
};

type RootData = {
  cart: Promise<CartType>;
  settings: any;
  selectedLocale: any;
  shop: any;
  analytics: {
    shopifySalesChannel: string;
    shopId: string;
  };
};

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context as ActionContext;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);
  let status = 200;
  let result;

  try {
    switch (action) {
      case CartForm.ACTIONS.LinesAdd:
        result = await cart.addLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesUpdate:
        result = await cart.updateLines(inputs.lines);
        break;
      case CartForm.ACTIONS.LinesRemove:
        result = await cart.removeLines(inputs.lineIds);
        break;
      case CartForm.ACTIONS.DiscountCodesUpdate:
        result = await cart.updateDiscountCodes(inputs.discountCodes);
        break;
      case CartForm.ACTIONS.BuyerIdentityUpdate:
        result = await cart.updateBuyerIdentity(inputs.buyerIdentity);
        break;
      case CartForm.ACTIONS.AttributesUpdateInput:
        result = await cart.updateAttributes(inputs.attributes);
        break;
      default:
        invariant(false, `${action} cart action is not defined`);
    }

    // Check for errors
    if (result.errors?.length || result.userErrors?.length) {
      throw new Error(
        result.errors?.[0]?.message ?? result.userErrors?.[0]?.message ?? 'Cart mutation failed',
      );
    }

    // The Cart ID may change after each mutation; update it in the session.
    const cartId = result.cart?.id;
    if (!cartId) {
      throw new Error('Missing cart ID from cart mutation');
    }
    
    const headers = cart.setCartId(cartId);

    // Handle redirect if a valid "redirectTo" parameter exists in form data
    const redirectTo = formData.get('redirectTo') ?? null;
    if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
      status = 303;
      headers.set('Location', redirectTo);
    }

    return json({
      cart: result.cart,
      errors: result.errors,
      userErrors: result.userErrors,
    }, {status, headers});

  } catch (error) {
    console.error('Cart action error:', error);
    return json(
      {
        cart: null,
        errors: [error instanceof Error ? error.message : 'Cart mutation failed'],
        userErrors: [],
      },
      {status: 400},
    );
  }
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context as ActionContext;
  const cartData = await cart.get();

  // Transform cart data for optimistic updates
  const transformedCart = cartData ? {
    ...cartData,
    lines: {
      nodes: flattenConnection(cartData.lines),
      edges: cartData.lines.edges,
      pageInfo: cartData.lines.pageInfo,
    },
  } : null;

  return json({
    cart: transformedCart,
  });
}

export default function CartRoute() {
  const {cart} = useLoaderData<typeof loader>();

  return (
    <div className="grid w-full justify-items-start gap-8 p-6 py-8 md:p-8 lg:p-12">
      <Cart layout="page" cart={cart} />
    </div>
  );
}
