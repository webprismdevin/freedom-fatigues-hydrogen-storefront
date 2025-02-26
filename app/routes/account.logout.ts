import {
  redirect,
  type ActionFunction,
  type AppLoadContext,
  type LoaderArgs,
  type ActionArgs,
} from '@shopify/remix-oxygen';

export async function doLogout(context: AppLoadContext) {
  const {session} = context;
  session.unset('customerAccessToken');

  return redirect(context.storefront.i18n.pathPrefix);
}

export async function loader({context}: LoaderArgs) {
  return redirect(context.storefront.i18n.pathPrefix);
}

export const action: ActionFunction = async ({context}: ActionArgs) => {
  return doLogout(context);
};
