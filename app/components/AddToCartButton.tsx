import {CartForm} from '@shopify/hydrogen';

// The action only executes on the server
export async function action({request, context}) {
  // The cart is setup on the context,
  // so available in any of your actions and loaders
  const {session, cart} = context;

  // Here we assume all requests are to add lines, but you might want to switch on
  // the action value to determine whether to add, remove, or update line items.
  const {action, inputs} = CartForm.getFormInput(await request.formData());

  // Built-in and custom cart methods are both available on the cart object
  const {cart: cartResult, errors} = await cart.addLines(inputs.lines);

  // Update the cookie headers because a new cart might have been created
  const headers = cart.setCartId(cartResult.id);

  return json(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    {headers},
  );
}

export function AddToCartButton({lines, children}) {
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
      <button>{children}</button>
    </CartForm>
  );
}
