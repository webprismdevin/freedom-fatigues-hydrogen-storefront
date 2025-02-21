# Hydrogen upgrade guide: 2023.10.2 to 2023.10.5

----

## Features

### New `h2 upgrade` command [#1458](https://github.com/Shopify/hydrogen/pull/1458)

#### Step: 1. Try the upgrade command via [#1458](https://github.com/Shopify/hydrogen/pull/1458)

[docs](https://shopify.dev/docs/custom-storefronts/hydrogen/cli#upgrade)
[#1458](https://github.com/Shopify/hydrogen/pull/1458)
```bash
# from the base of the project run
h2 upgrade
```

#### Step: 2. Upgrade to a specific Hydrogen version with the --version flag [#1458](https://github.com/Shopify/hydrogen/pull/1458)

[docs](https://shopify.dev/docs/custom-storefronts/hydrogen/cli#upgrade)
[#1458](https://github.com/Shopify/hydrogen/pull/1458)
```bash
h2 upgrade --version 2023.10.3
```

### Enable debugger connections by passing `--debug` flag to the `h2 dev` command [#1480](https://github.com/Shopify/hydrogen/pull/1480)

#### Step: 1. Debugging on the default runtime (Node.js sandbox): [#1480](https://github.com/Shopify/hydrogen/pull/1480)

[#1480](https://github.com/Shopify/hydrogen/pull/1480)
```bash
h2 dev --debug
```

#### Step: 2. Debugging on the new worker runtime: [#1480](https://github.com/Shopify/hydrogen/pull/1480)

[#1480](https://github.com/Shopify/hydrogen/pull/1480)
```bash
h2 dev --debug --worker-unstable
```

### Added an optional prop to the `ShopPayButton` to enable order attribution support for either the Headless or Hydrogen sales channel. [#1447](https://github.com/Shopify/hydrogen/pull/1447)

#### Customize the order attribution via the `channel` prop
[#1447](https://github.com/Shopify/hydrogen/pull/1447)
```diff
<ShopPayButton
    variantIds={[variantId]}
    storeDomain={storeDomain}
+  channel="headless || hydrogen"
/>
```

----

----

## Fixes

### In TypeScript projects, when updating to the latest `@shopify/remix-oxygen` adapter release, please update also to the latest version of `@shopify/oxygen-workers-types` [#1494](https://github.com/Shopify/hydrogen/pull/1494)

#### Upgrade @shopify/oxygen-workers-types dependency
[#1494](https://github.com/Shopify/hydrogen/pull/1494)
```diff
"devDependencies": {
  "@remix-run/dev": "2.1.0",
  "@remix-run/eslint-config": "2.1.0",
- "@shopify/oxygen-workers-types": "^3.17.3",
+ "@shopify/oxygen-workers-types": "^4.0.0",
  "@shopify/prettier-config": "^1.1.2",
  ...
},
```

### Updated internal dependencies for bug resolution [#1496](https://github.com/Shopify/hydrogen/pull/1496)

#### Update the `@shopify/cli` dependency in your app to avoid duplicated subdependencies:
[#1496](https://github.com/Shopify/hydrogen/pull/1496)
```diff
  "dependencies": {
-   "@shopify/cli": "3.50.2",
+   "@shopify/cli": "3.51.0",
  }
```

### Add `@remix-run/server-runtime` as a dev dependency.  [#1489](https://github.com/Shopify/hydrogen/pull/1489)

#### Since Remix is now a peer dependency of `@shopify/remix-oxygen`, you need to add `@remix-run/server-runtime` to your dependencies with the same version you have for the rest of Remix dependencies
[#1489](https://github.com/Shopify/hydrogen/pull/1489)
```diff
"dependencies": {
  "@remix-run/react": "2.1.0"
+ "@remix-run/server-runtime": "2.1.0"
  ...
}
```
