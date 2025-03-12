import {createStorefrontClient} from '@shopify/hydrogen';
export const client = createStorefrontClient({
  // load environment variables according to your framework and runtime
  storeDomain: process.env.PUBLIC_STORE_DOMAIN,
  publicStorefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
});
