# Hydrogen upgrade guide: 2023.7.13 to 2023.10.0

----

## Breaking changes

### The Codegen feature is now considered stable and related dependencies have been updated [#1108](https://github.com/Shopify/hydrogen/pull/1108)

#### Step: 1. Update the `dev` script [#1108](https://github.com/Shopify/hydrogen/pull/1108)

[#1108](https://github.com/Shopify/hydrogen/pull/1108)
// package.json

```diff
"scripts": {
     //......
-     "dev": "shopify hydrogen dev --codegen-unstable",
+    "dev": "shopify hydrogen dev --codegen",
}
```

#### Step: 2. Update the `codegen` script [#1108](https://github.com/Shopify/hydrogen/pull/1108)

[#1108](https://github.com/Shopify/hydrogen/pull/1108)
// package.json

```diff
"scripts": {
     //......
-    "codegen": "shopify hydrogen codegen-unstable",
+   "codegen": "shopify hydrogen codegen"
}
```

### The Storefront API types included are now generated using @graphql-codegen/typescript@4 [#1108](https://github.com/Shopify/hydrogen/pull/1108)

#### This results in a breaking change if you were importing `Scalars` directly from `@shopify/hydrogen-react` or `@shopify/hydrogen`
[docs](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/plugins/typescript/typescript/CHANGELOG.md#400)
[#1108](https://github.com/Shopify/hydrogen/pull/1108)
// all instances of `Scalars` imports

```diff
import type {Scalars} from '@shopify/hydrogen/storefront-api-types';

type Props = {
-  id: Scalars['ID']; // This was a string
+  id: Scalars['ID']['input']; // Need to access 'input' or 'output' to get the string
 };
```

----

## Features

### Storefront client the default caching strategy has been updated  [#1336](https://github.com/Shopify/hydrogen/pull/1336)

#### The new default caching strategy provides a max-age value of 1 second, and a stale-while-revalidate value of 1 day. If you would keep the old caching values, update your queries to use `CacheShort`
[#1336](https://github.com/Shopify/hydrogen/pull/1336)
// all instances of storefront.query

```diff
 const {product} = await storefront.query(
   `#graphql
     query Product($handle: String!) {
       product(handle: $handle) { id title }
     }
   `,
   {
     variables: {handle: params.productHandle},
+    /**
+     * Override the default caching strategy with the old caching values
+     */
+    cache: storefront.CacheShort(),
   },
 );
```

----

----

## Fixes

### Custom cart methods are now stable [#1440](https://github.com/Shopify/hydrogen/pull/1440)

#### Update `createCartHandler` if needed
[#1440](https://github.com/Shopify/hydrogen/pull/1440)
// server.ts

```diff
const cart = createCartHandler({
   storefront,
   getCartId,
   setCartId: cartSetIdDefault(),
-  customMethods__unstable: {
+  customMethods: {
     addLines: async (lines, optionalParams) => {
      // ...
     },
   },
 });
```

### Updated CLI dependencies to improve terminal output. [#1456](https://github.com/Shopify/hydrogen/pull/1456)

#### Upgrade `@shopify/cli dependency`
[#1456](https://github.com/Shopify/hydrogen/pull/1456)
```bash
npm add @shopify/cli@3.50.0
```

### Updated the starter template `Header` and `Footer` menu components for 2023.10.0 [#1465](https://github.com/Shopify/hydrogen/pull/1465)

#### Step: 1. Update the HeaderMenu component to accept a primaryDomainUrl and include it in the internal url check [#1465](https://github.com/Shopify/hydrogen/pull/1465)

[#1465](https://github.com/Shopify/hydrogen/pull/1465)
```diff
// app/components/Header.tsx

+ import type {HeaderQuery} from 'storefrontapi.generated';

export function HeaderMenu({
  menu,
+  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
+  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {

  // ...code

  // if the url is internal, we strip the domain
  const url =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
+   item.url.includes(primaryDomainUrl)
      ? new URL(item.url).pathname
      : item.url;

   // ...code

}
```

#### Step: 2. Update the FooterMenu component to accept a primaryDomainUrl prop and include it in the internal url check [#1465](https://github.com/Shopify/hydrogen/pull/1465)

[#1465](https://github.com/Shopify/hydrogen/pull/1465)
```diff
// app/components/Footer.tsx

- import type {FooterQuery} from 'storefrontapi.generated';
+ import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

function FooterMenu({
  menu,
+  primaryDomainUrl,
}: {
  menu: FooterQuery['menu'];
+  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
}) {
  // code...

  // if the url is internal, we strip the domain
  const url =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
+   item.url.includes(primaryDomainUrl)
      ? new URL(item.url).pathname
      : item.url;

   // ...code

  );
}
```

#### Step: 3. Update the Footer component to accept a shop prop [#1465](https://github.com/Shopify/hydrogen/pull/1465)

[#1465](https://github.com/Shopify/hydrogen/pull/1465)
```diff
export function Footer({
  menu,
+ shop,
}: FooterQuery & {shop: HeaderQuery['shop']}) {
  return (
    <footer className="footer">
-      <FooterMenu menu={menu} />
+      <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
    </footer>
  );
}
```

#### Step: 4. Update Layout.tsx to pass the shop prop [#1465](https://github.com/Shopify/hydrogen/pull/1465)

[#1465](https://github.com/Shopify/hydrogen/pull/1465)
```diff
export function Layout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
}: LayoutProps) {
  return (
    <>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside menu={header.menu} shop={header.shop} />
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Suspense>
        <Await resolve={footer}>
-          {(footer) => <Footer menu={footer.menu}  />}
+          {(footer) => <Footer menu={footer.menu} shop={header.shop} />}
        </Await>
      </Suspense>
    </>
  );
}
```

### Enhance useMatches returned type inference [#1289](https://github.com/Shopify/hydrogen/pull/1289)

#### If you are calling `useMatches()` in different places of your app to access the data returned by the root loader, you may want to update it to the following pattern to enhance types:
[#1289](https://github.com/Shopify/hydrogen/pull/1289)
```ts
// root.tsx

import {useMatches} from '@remix-run/react';
import {type SerializeFrom} from '@shopify/remix-oxygen';

export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

export function loader(context) {
  // ...
}
```
