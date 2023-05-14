import {ActionArgs, LoaderArgs, json} from '@remix-run/server-runtime';
import {logsnag} from '~/lib/logsnag';

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

  // data = {
  //   a: 'QuicR8',
  //   email,
  //   variant,
  //   platform: 'shopify',
  // };

  const response = await fetch(klaviyo_endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: urlencoded,
    redirect: 'follow',
  })

  // if (response.status !== 202) {
  //   await logsnag.publish({
  //     channel: 'email-form-submission',
  //     event: `Back In Stock Signup Error: ${response.status}`,
  //     description: `Email: ${email} - Source: ${source} - Status: ${response.status}`,
  //     icon: '❌',
  //     notify: true,
  //   });
  // }

  return json({
    error: null,
    ok: response,
  });
}
