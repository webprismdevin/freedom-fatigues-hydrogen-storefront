import {LoaderArgs} from '@shopify/remix-oxygen';

//true

export async function loader({params}: LoaderArgs) {
  throw new Response('Not found', {status: 404});
}

export default function Component() {
  return null;
}
