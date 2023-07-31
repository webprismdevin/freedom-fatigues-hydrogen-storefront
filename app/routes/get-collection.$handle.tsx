import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';
import type {
  CollectionConnection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export async function loader({params, context: {storefront}}: LoaderArgs) {
  const {handle} = params;

  return json(await getFeaturedData(storefront, handle));
}

export async function getFeaturedData(
  storefront: LoaderArgs['context']['storefront'],
  handle: string,
) {
  const data = await storefront.query<{
    collection: CollectionConnection;
  }>(COLLECTION_PRODUCT_QUERY, {
    variables: {
      handle: handle,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    collection: data,
  };
}

const COLLECTION_PRODUCT_QUERY = `#graphql
    ${PRODUCT_CARD_FRAGMENT}
    query collectionProductQuery($handle: String!) {
        collectionByHandle(handle: $handle) {
            products(first: 12) {
                nodes {
                    ...ProductCard
                }
            }
        }
    }
`;
