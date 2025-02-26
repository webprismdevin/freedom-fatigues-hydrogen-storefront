import {json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

// Define a type for the product recommendation from the API
type ProductRecommendation = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    url: string;
    altText?: string;
  } | null;
  ratingMetafield?: {
    value: string;
  } | null;
  reviewCountMetafield?: {
    value: string;
  } | null;
};

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
        ratingMetafield: metafield(namespace: "loox", key: "avg_rating") {
          value
        }
        reviewCountMetafield: metafield(namespace: "loox", key: "num_reviews") {
          value
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

  // Process the recommendations to extract rating and reviewCount from metafields
  const processedRecommendations = recommendations.map((product: ProductRecommendation) => {
    const { ratingMetafield, reviewCountMetafield, ...rest } = product;
    return {
      ...rest,
      rating: ratingMetafield?.value ? parseFloat(ratingMetafield.value) : 0,
      reviewCount: reviewCountMetafield?.value ? parseInt(reviewCountMetafield.value) : 0
    };
  });

  return json({ recommendations: processedRecommendations });
}
