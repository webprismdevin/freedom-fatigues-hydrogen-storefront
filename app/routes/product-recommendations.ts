import {json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

  if (!productId) {
    throw new Response('Missing product id', {status: 400});
  }

  console.log('productId', productId);

  // Query for product recommendations using the specified intent with the product's ID
  const PRODUCT_RECOMMENDATIONS_QUERY = `
    query getProductRecommendations($productId: ID!, $intent: ProductRecommendationIntent!) {
      productRecommendations(productId: $productId, intent: $intent) {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  `;

  // Try COMPLEMENTARY first
  const complementaryData = await context.storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
    variables: { productId, intent: 'COMPLEMENTARY' },
  });

  let recommendations;

  // If no COMPLEMENTARY recommendations, try RELATED
  if (!complementaryData.productRecommendations?.length) {
    const relatedData = await context.storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: { productId, intent: 'RELATED' },
    });
    recommendations = relatedData.productRecommendations;
  } else {
    recommendations = complementaryData.productRecommendations;
  }

  // Apply limit if specified
  if (limit && recommendations.length > limit) {
    recommendations = recommendations.slice(0, limit);
  }

  return json({ recommendations });
}
