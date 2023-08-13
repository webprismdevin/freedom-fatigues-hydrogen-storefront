import {LoaderFunction, json} from '@shopify/remix-oxygen';
import {RebuyPriceRange} from '~/components/ProductCard';

interface RebuyResponse {
  data: [any];
}

export const loader: LoaderFunction = async ({params, request}) => {
  const {resource} = params;

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const lines = searchParams.get('lines');

  const response = await fetch(
    `https://rebuyengine.com/api/v1/products/${resource}?key=269507ca244802f7cfc0b6570a09d34463258094&limit=100&metafields=yes&filter_oos=yes&shopify_product_ids=${lines}`,
  );

  const data: RebuyResponse = await response.json();

  const products = data.data.map((product) => {
    const avg_rating =
      product.metafields.find(
        (metafield: any) => metafield.key === 'avg_rating',
      )?.value ?? 0;
    const caption =
      product.metafields.find((metafield: any) => metafield.key === 'caption')
        ?.value ?? '';

    const maxPrice = product.variants.reduce((max, variant) => {
      return variant.price > max ? variant.price : max;
    }, 0) as number;

    const minPrice = product.variants.reduce((min, variant) => {
      return variant.price < min ? variant.price : min;
    }, Infinity) as number;

    const isRange = maxPrice !== minPrice;

    const priceRange: RebuyPriceRange = {
      max: maxPrice,
      min: minPrice,
      isRange: isRange,
    };

    return {
      ...product,
      avg_rating,
      caption,
      priceRange,
    };
  });

  return json(products);
};
