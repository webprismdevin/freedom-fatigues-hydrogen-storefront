import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

export async function loader({context: {storefront}, params}: LoaderArgs) {
  return json(await getRedo(storefront));
}

export async function getRedo(storefront: LoaderArgs['context']['storefront']) {
  const data = await storefront.query(REDO_QUERY);

  invariant(data, 'No redo product data returned from Shopify API');

  return data;
}

const REDO_QUERY = `query {
    products(first: 10, query: "vendor:'re:do'") {
      edges {
        node {
          id
          title
          description
          variants(first: 10, reverse: true){
            edges {
                node {
                id
                title
                price{
                    amount
                } 
              }
            }
          }
        }
      }
    }
  }`;
