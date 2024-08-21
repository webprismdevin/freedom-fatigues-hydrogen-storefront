# Hydrogen upgrade guide: 2023.7.2 to 2023.7.13

----

## Breaking changes

### Support Hot Module Replacement (HMR) and Hot Data Revalidation (HDR) [#1187](https://github.com/Shopify/hydrogen/pull/1187)

#### Step: 1. Enable the v2 dev server in remix.config.js [#1187](https://github.com/Shopify/hydrogen/pull/1187)

[#1187](https://github.com/Shopify/hydrogen/pull/1187)
```diff
future: {
+ v2_dev: true,
  v2_meta: true,
  v2_headers: true,
  // ...
}
```

#### Step: 2. Add Remix `<LiveReload />` component if you don't have it to your `root.jsx` or `root.tsx` file [#1187](https://github.com/Shopify/hydrogen/pull/1187)

[#1187](https://github.com/Shopify/hydrogen/pull/1187)
```diff
import {
  Outlet,
  Scripts,
+ LiveReload,
  ScrollRestoration,
} from '@remix-run/react';

// ...

export default function App() {
  // ...
  return (
    <html>
      <head>
       {/* ...  */}
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
+       <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  // ...
  return (
    <html>
      <head>
        {/* ... */}
      </head>
      <body>
        Error!
        <Scripts />
+       <LiveReload />
      </body>
    </html>
  );
}
```

----

## Features

### Added `h2 debug cpu` command to profile CPU startup times (experimental) [#1352](https://github.com/Shopify/hydrogen/pull/1352)

#### Run `h2 debug cpu`
> This command builds + watches your app and generates a `startup.cpuprofile` file that you can open in DevTools or VSCode to see a flamegraph of CPU usage
[#1352](https://github.com/Shopify/hydrogen/pull/1352)
```bash
h2 debug cpu
```

### Added support for `withCache` request in debug-network tool [#1438](https://github.com/Shopify/hydrogen/pull/1438)

#### Calls to withCache can now be shown in the `/debug-network` tool when using the Worker runtime. For this to work, use the new `request` parameter in `createWithCache`
[#1438](https://github.com/Shopify/hydrogen/pull/1438)
// server.ts

```diff
export default {
  fetch(request, env, executionContext) {
    // ...
    const withCache = createWithCache({
      cache,
      waitUntil,
+     request,
    });
    // ...
  },
}
```

### Support custom attributes with `useLoadScript` [#1442](https://github.com/Shopify/hydrogen/pull/1442)

#### Step: 1. Pass `attributes` to any script [#1442](https://github.com/Shopify/hydrogen/pull/1442)

[#1442](https://github.com/Shopify/hydrogen/pull/1442)
// any instance of useLoadScript

```diff
+ const attributes = {
+    'data-test': 'test',
+    test: 'test',
+  }

- const scriptStatus = useLoadScript('test.js' )
const scriptStatus = useLoadScript('test.js', {  attributes } )
```

#### Step: 2. Would append a DOM element [#1442](https://github.com/Shopify/hydrogen/pull/1442)

[#1442](https://github.com/Shopify/hydrogen/pull/1442)
```html
<script src="test.js" data-test="test" test="test" />
```

### Add server-side network requests debugger (unstable) [#1284](https://github.com/Shopify/hydrogen/pull/1284)

#### Step: 1. Update server.ts so that it also passes in waitUntil and env [#1284](https://github.com/Shopify/hydrogen/pull/1284)

[#1284](https://github.com/Shopify/hydrogen/pull/1284)
```diff
const handleRequest = createRequestHandler({
    build: remixBuild,
    mode: process.env.NODE_ENV,
+    getLoadContext: () => ({session, storefront, env, waitUntil}),
});
```

#### Step: 2. If using typescript, also update `remix.env.d.ts` [#1284](https://github.com/Shopify/hydrogen/pull/1284)

[#1284](https://github.com/Shopify/hydrogen/pull/1284)
```diff
  declare module '@shopify/remix-oxygen' {
    export interface AppLoadContext {
+     env: Env;
      cart: HydrogenCart;
      storefront: Storefront;
      session: HydrogenSession;
+      waitUntil: ExecutionContext['waitUntil'];
    }
  }
```

### Add TypeScript v5 compatibility [#1240](https://github.com/Shopify/hydrogen/pull/1240)

#### Update typescript
> If you have typescript as a dev dependency in your app, it is recommended to change its version as follows:
[#1240](https://github.com/Shopify/hydrogen/pull/1240)
```diff
  "devDependencies": {
    ...
-   "typescript": "^4.9.5",
+   "typescript": "^5.2.2",
  }
}
```

----

----

## Fixes

### Fix the Pagination component to reset internal state when the URL changes [#1291](https://github.com/Shopify/hydrogen/pull/1291)

#### Add `startCursor` to the query pageInfo
> Update pageInfo in all pagination queries. Here is an example route with a pagination query
[#1291](https://github.com/Shopify/hydrogen/pull/1291)
```diff
query CollectionDetails {
   collection(handle: $handle) {
     ...
     pageInfo {
       hasPreviousPage
       hasNextPage
       hasNextPage
       endCursor
+      startCursor
     }
   }
}
```
