# Hydrogen upgrade guide: 2023.4.6 to 2023.7.0

----

## Features

### Stabilize Pagination and getPaginationVariables [#1129](https://github.com/Shopify/hydrogen/pull/1129)

#### Step: 1. Rename getPaginationVariables_unstable to getPaginationVariables [#1129](https://github.com/Shopify/hydrogen/pull/1129)

[#1129](https://github.com/Shopify/hydrogen/pull/1129)
```diff
- import {getPaginationVariables__unstable} from '@shopify/hydrogen';
+ import {getPaginationVariables} from '@shopify/hydrogen';
```

#### Step: 2. Rename Pagination_unstable to Pagination [#1129](https://github.com/Shopify/hydrogen/pull/1129)

[#1129](https://github.com/Shopify/hydrogen/pull/1129)
```diff
- import {Pagiatinon__unstable} from '@shopify/hydrogen';
+ import {Pagiatinon} from '@shopify/hydrogen';
```

----

----

## Fixes

### Stabilize the createWithCache function [#1151](https://github.com/Shopify/hydrogen/pull/1151)

#### Rename createWithCache_unstable to createWithCache
[#1151](https://github.com/Shopify/hydrogen/pull/1151)
```diff
- import {createWithCache_unstable} from '@shopify/hydrogen';
+ import {createWithCache} from '@shopify/hydrogen';
```
