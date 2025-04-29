import type { EntryContext } from '@shopify/remix-oxygen';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createContentSecurityPolicy } from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  // Check if the URL contains /apps and perform redirect
  const url = new URL(request.url);
  if (url.pathname.startsWith('/apps')) {
    const newUrl = new URL(url.pathname + url.hash, 'https://checkout.ownbosssupplyco.com');
    const redirectHeaders = new Headers();
    redirectHeaders.set('Location', newUrl.toString());
    return new Response(null, {
      status: 301,
      headers: redirectHeaders
    });
  }

  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    defaultSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'strict-dynamic'",
      "data:",
      "blob:",
      "*.shopify.com",
      "*.myshopify.com",
      "*.freedomfatigues.com",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.google.com",
      "*.googletagmanager.com",
      "*.facebook.com",
      "*.cloudfront.net",
      "cdn.sanity.io",
      "fonts.googleapis.com",
      "fonts.gstatic.com",
      "localhost:*",
      "*.getfondue.com",
      "googleads.g.doubleclick.net",
      "getredo.com"
    ],
    connectSrc: [
      "'self'",
      "data:",
      "blob:",
      "ws:",
      "wss:",
      "*.shopify.com",
      "*.shopifysvc.com",
      "*.myshopify.com",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.google-analytics.com",
      "*.doubleclick.net",
      "*.facebook.com",
      "*.sanity.io",
      "cdn.sanity.io",
      "*.botpoison.com",
      "localhost:*",
      "e.aimerce.ai",
      "api.getfondue.com",
      "sc-static.net",
      "google.com/pagead/",
      "analytics.google.com",
      "*.getredo.com",
      "submit-form.com/9WklqL8w",
      "www.google.com/ccm/collect"
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "blob:",
      "*.shopify.com",
      "*.myshopify.com",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.google.com",
      "*.googletagmanager.com",
      "*.facebook.com",
      "connect.facebook.net",
      "cdn.sanity.io",
      "*.aimerce.ai",
      "*.getfondue.com",
      "localhost:*",
    ],
    scriptSrcElem: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "blob:",
      "*.shopify.com",
      "*.myshopify.com",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.google.com",
      "*.googletagmanager.com",
      "*.facebook.com",
      "connect.facebook.net",
      "cdn.sanity.io",
      "*.aimerce.ai",
      "*.getfondue.com",
      "localhost:*",
      "*.youtube.com",
      "loox.io",
      "*.getredo.com",
      "*.google-analytics.com",
      "*.googleadservices.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "*.shopify.com",
      "*.myshopify.com",
      "fonts.googleapis.com",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.getredo.com",
      "*.getfondue.com"

    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "localhost:*",
      "*.shopify.com",
      "*.myshopify.com",
      "*.freedomfatigues.com",
      "*.facebook.com",
      "*.google-analytics.com",
      "*.doubleclick.net",
      "*.judge.me",
      "*.klaviyo.com",
      "*.posthog.com",
      "*.google.com",
      "*.googletagmanager.com",
      "cdn.sanity.io",
      "*.getfondue.com",
      "*.cloudfront.net",
      "*.govx.net"
    ],
    frameAncestors: [
      "'self'",
      "*.shopify.com",
      "*.myshopify.com",
      "*.sanity.studio",
      "*.google.com",
    ],
    fontSrc: [
      "'self'",
      "data:",
      "*.shopify.com",
      "fonts.gstatic.com",
      "*.cloudfront.net",
      "*.posthog.com",
      "*.klaviyo.com",
      "*.getfondue.com"
    ],
    frameSrc: [
      "'self'",
      "*.shopify.com",
      "*.youtube.com",
      "*.sanity.studio",
      "*.captcha-delivery.com",
      "*.facebook.com",
      "*.klaviyo.com",
      "loox.io",
      "www.googletagmanager.com",
      "*.google-analytics.com",
      "td.doubleclick.net",
      "*.doubleclick.net"
    ],
    workerSrc: ["'self'", "blob:"],
    mediaSrc: ["'self'", "data:", "blob:", "*.shopify.com", "*.cloudfront.net"],
    objectSrc: ["'none'"],
    manifestSrc: ["'self'"],
  });
  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={{...remixContext, isSpaMode: false}} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
