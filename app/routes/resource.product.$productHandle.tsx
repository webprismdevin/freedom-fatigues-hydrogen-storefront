import {LoaderFunctionArgs, json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export type Option = {
  name: string;
  value: string;
};

/**
 * Gets an individual product by handle with selected options
 */
export async function loader({context, params, request}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Get selected options from the URL
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  
  const selectedOptions: Option[] = [];
  
  // Extract all options from query parameters
  for (const [name, value] of searchParams.entries()) {
    selectedOptions.push({name, value});
  }

  const {product} = await getProductData(
    context.storefront,
    productHandle,
    selectedOptions,
  );

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return json({
    product,
  });
}

export async function getProductData(
  storefront: LoaderFunctionArgs['context']['storefront'],
  handle: string,
  selectedOptions: Option[],
) {
  const data = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No product data returned from Shopify API');

  return data;
}

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Product(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductCard
      descriptionHtml
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
    }
  }
`; 