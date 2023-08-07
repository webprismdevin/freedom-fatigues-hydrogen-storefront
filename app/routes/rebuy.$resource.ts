import {LoaderFunction, json} from '@shopify/remix-oxygen';

interface RebuyResponse {
  data: [any];
}

export const loader: LoaderFunction = async ({params, request}) => {
  const {resource} = params;

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const lines = searchParams.get('lines');

  console.log(lines)

  const response = await fetch(
    `https://rebuyengine.com/api/v1/products/${resource}?key=269507ca244802f7cfc0b6570a09d34463258094&limit=6&metafields=yes&filter_oos=yes&shopify_product_ids=${lines}`,
  );

  const data: RebuyResponse = await response.json();

  return json(data.data);
};
