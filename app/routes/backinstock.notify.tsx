import {ActionArgs, LoaderArgs, json} from '@remix-run/server-runtime';
import {logsnag} from '~/lib/logsnag';

const klaviyo_endpoint = 'https://a.klaviyo.com/api/v1/catalog/subscribe';

export async function action({request, context}: ActionArgs) {
  const form = await request.formData();
  const email = form.get('email');
  const variant = form.get('variant');

  if (!email) {
    return json({error: 'Missing email or source', ok: false});
  }

  const response = await fetch(klaviyo_endpoint, {
    method: 'POST',
    // headers: {
    //   Authorization: `Klaviyo-API-Key ${context.env.KLAVIYO_API_KEY}`,
    //   revision: '2023-02-22',
    //   Accept: 'application/json',
    //   'Content-Type': 'application/json',
    // },
    body: JSON.stringify({
      a: 'QuicR8',
      email,
      variant,
      platform: 'shopify',
    }),
  });

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
