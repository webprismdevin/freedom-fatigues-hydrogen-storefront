import { LoaderFunction, json } from "@shopify/remix-oxygen";

interface RebuyResponse {
    data: [any]
}

export const loader: LoaderFunction = async ({ params }) => {
    const { resource } = params;

    const response = await fetch(`https://rebuyengine.com/api/v1/products/${resource}?key=269507ca244802f7cfc0b6570a09d34463258094&limit=10&metafields=yes`);

    const data:RebuyResponse = await response.json();

    return json(data.data);

}