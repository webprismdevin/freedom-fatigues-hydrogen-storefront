import {LoaderFunction} from '@shopify/remix-oxygen';
import {getClientIPAddress} from 'remix-utils';

const PIXEL_ID = '280447639311369';
const API_VER = 'v18.0';
// const FB_CAPI_TOKEN = process.env.FB_CAPI_TOKEN;
//api endpoint

export const loader: LoaderFunction = async ({params, request, context}) => {
  const endpoint = `https://graph.facebook.com/${API_VER}/${PIXEL_ID}/events?access_token=${context.env.FB_CAPI_TOKEN}`;

  const searchParams = new URLSearchParams(request.url.split('?')[1]);

  const body = JSON.stringify({
    data: [
      {
        event_id: searchParams.get('event_id'),
        event_name: params.event,
        event_time: new Date(Date.now()),
        event_source_url: searchParams.get('event_source_url'),
        action_source: 'website',
        user_data: {
          client_ip_address: getClientIPAddress(request),
          client_user_agent: request.headers.get('user-agent'),
        },
        custom_data: {
          content_ids: [searchParams.get('content_ids')],
          content_name: searchParams.get('content_name'),
          content_type: searchParams.get('content_type'),
          value: Number(searchParams.get('value')),
          currency: searchParams.get('currency'),
        },
      },
    ],
    test_event_code: "TEST26570"
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (response.status !== 200) {
    return new Response('Error', {status: 500});
  }

  return new Response('OK', {status: 200});
};
