import {ActionArgs, LoaderArgs, json} from '@shopify/remix-oxygen';

const klaviyo_endpoint =
  'https://a.klaviyo.com/onsite/components/back-in-stock/subscribe';

export async function action({request, context}: ActionArgs) {
  const form = await request.formData();
  const email = form.get('email');
  const variant = form.get('variant');

  if (!email || !variant) {
    return json({error: 'Missing email or variant', ok: false});
  }

  const urlencoded = new URLSearchParams();
  urlencoded.append('a', 'QuicR8');
  urlencoded.append('email', email as string);
  urlencoded.append('variant', variant as string);
  urlencoded.append('platform', 'shopify');

  const response = await fetch(klaviyo_endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: urlencoded,
    redirect: 'follow',
  });

  return json({
    error: null,
    ok: response,
  });
}
