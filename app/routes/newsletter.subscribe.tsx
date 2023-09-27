import {ActionArgs, LoaderArgs, json} from "@shopify/remix-oxygen";

const klaviyo_endpoint =
  'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/';

export async function action({request, context}: ActionArgs) {
  const form = await request.formData();
  const source = form.get('source');
  const email = form.get('email');

  if (!email || !source) {
    return json({error: 'Missing email or source', ok: false});
  }

  const response = await fetch(klaviyo_endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Klaviyo-API-Key ${context.env.KLAVIYO_API_KEY}`,
      revision: '2023-02-22',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          list_id: 'HFuWjF',
          custom_source: source,
          subscriptions: [
            {
              channels: {
                email: ['MARKETING'],
              },
              email,
            },
          ],
        },
      },
    }),
  });

  return json({
    error: null,
    ok: response.status === 202 ? true : false,
  });
}
