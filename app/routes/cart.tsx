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
import {CartForm} from '@shopify/hydrogen';
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
  const {session, cart} = context as unknown as ActionContext;

  // Parse form data and get the customer access token in parallel
  const [formData, customerAccessToken] = await Promise.all([
    request.formData(),
    session.get('customerAccessToken'),
  ]);

  const {action, inputs} = CartForm.getFormInput(formData);

  // If no cart action is provided, this invariant will throw an error
  invariant(action, 'No cartAction defined');

  let status = 200;
  let result;

  // Process the received cart action
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
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode as string | undefined;
      // Create an array that contains the user-provided discount code, if any
      const discountCodes: string[] = [];
      if (formDiscountCode) discountCodes.push(formDiscountCode);
      // Append any discount codes already applied on the cart
      if (Array.isArray(inputs.discountCodes)) {
        discountCodes.push(...(inputs.discountCodes as string[]));
      }
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
        customerAccessToken,
      });
      break;
    case CartForm.ACTIONS.AttributesUpdateInput:
      result = await cart.updateAttributes(inputs.attributes);
      break;
    default:
      invariant(false, `${action} cart action is not defined`);
  }

  // The Cart ID may change after each mutation; update it in the session.
  const cartId = result.cart.id;
  const headers = cart.setCartId(cartId);

  // Handle redirect if a valid "redirectTo" parameter exists in form data
  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string' && isLocalPath(redirectTo)) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  const {cart: cartResult, errors} = result;
  return json(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context as unknown as ActionContext;
  const cartData = await cart.get();
  return json({cart: cartData});
}

export default function CartRoute() {
  const {cart} = useLoaderData<typeof loader>();

  return (
    <div className="grid w-full justify-items-start gap-8 p-6 py-8 md:p-8 lg:p-12">
      <Cart layout="page" cart={cart} />
    </div>
  );
}
