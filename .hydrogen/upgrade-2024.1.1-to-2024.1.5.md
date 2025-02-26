# Hydrogen upgrade guide: 2024.1.1 to 2024.1.5

----

## Fixes

### Fix 404 not working on certain unknown and i18n routes [#1732](https://github.com/Shopify/hydrogen/pull/1732)

#### Add a `($locale).tsx` route with the following contents
[#1732](https://github.com/Shopify/hydrogen/pull/1732)
```js
import {type LoaderFunctionArgs} from '@remix-run/server-runtime';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are still at the default locale
    // then the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  return null;
}
```
