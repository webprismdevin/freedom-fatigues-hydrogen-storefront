import {redirect, type LoaderFunctionArgs, type AppLoadContext} from '@shopify/remix-oxygen';
import type {HydrogenCart} from '@shopify/hydrogen';

type LoaderContext = AppLoadContext & {
  cart: HydrogenCart;
  session: {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string) => Promise<void>;
    commit: () => Promise<string>;
  };
};

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the cart handler
 * @param ?redirect an optional path to return to otherwise return to the home page
 * @example
 * Example path applying a discount and redirecting
 * ```ts
 * /discounts/FREESHIPPING?redirect=/products
 *
 * ```
 * @preserve
 */
export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {cart, session} = context as unknown as LoaderContext;
  const {code} = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const redirectUrl =
    searchParams.get('redirect') || searchParams.get('return_to') || '/';

  const headers = new Headers();

  if (!code) {
    return redirect(redirectUrl);
  }

  let cartId = await session.get('cartId');

  //! if no existing cart, create one
  if (!cartId) {
    const result = await cart.create({});
    cartId = result.cart.id;
    session.set('cartId', cartId);
  }

  //! apply discount to the cart
  await cart.updateDiscountCodes([code]);

  return redirect(redirectUrl, {headers});
}
