import {type MetaFunction, type ActionFunction} from '@shopify/remix-oxygen';
import {PageHeader, Section} from '~/components';
import {Form, useActionData} from '@remix-run/react';
import {useEffect} from 'react';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Contact Us - Freedom Fatigues',
    },
  ];
};

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes': string[];
  action: string;
  cdata: string;
}

export const action: ActionFunction = async ({request}) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  const token = formData.get('cf-turnstile-response');

  console.log('Turnstile token:', token); // Debug log

  // Verify Turnstile token
  const turnstileResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: '0x4AAAAAABQ8KUru0Jjd0L6dMmKA47kllss',
        response: token,
      }),
    },
  );

  const turnstileData = (await turnstileResponse.json()) as TurnstileResponse;

  if (!turnstileData.success) {
    console.error('Turnstile verification failed:', {
      errors: turnstileData['error-codes'],
      hostname: turnstileData.hostname,
      timestamp: turnstileData.challenge_ts,
      token: token // Debug log
    });
    return {success: false, error: `Bot verification failed: ${turnstileData['error-codes'].join(', ')}`};
  }

  try {
    const response = await fetch('https://submit-form.com/9WklqL8w', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return {success: true};
  } catch (error) {
    console.error('Form submission error:', error);
    return {success: false, error: 'Failed to submit form. Please try again.'};
  }
};

export default function ContactUs() {
  const actionData = useActionData<{success: boolean; error?: string}>();

  useEffect(() => {
    // Load the Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <PageHeader heading="Contact Us" />
      <Section padding="x" className="prose mx-auto">
        <p className="text-lg font-medium">We're here to help!</p>

        <p className="mb-8">
          For help, email us at{' '}
          <a href="mailto:customerservice@freedomfatigues.com">
            customerservice@freedomfatigues.com
          </a>
        </p>

        {actionData?.success ? (
          <div className="mb-8 rounded-lg bg-green-100 p-4 text-green-700">
            <p className="font-medium">Thank you for your message!</p>
            <p>We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <Form
            method="post"
            className="mb-8 space-y-4"
          >
            {actionData?.error && (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                <p>{actionData.error}</p>
              </div>
            )}

            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                required
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your email"
                required
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="message" className="mb-2 font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Your message"
                required
                rows={4}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div 
              className="cf-turnstile" 
              data-sitekey="0x4AAAAAABQ8KXEpdv4cqhBh"
              data-theme="light"
            ></div>

            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 text-contrast hover:opacity-90"
            >
              Send Message
            </button>
          </Form>
        )}

        <h2>Top FAQs</h2>
        <p>
          At Freedom Fatigues, we take customer support incredibly seriously. Our
          team is dedicated to making sure that every customer feels heard and
          valued, and we always put our best effort into helping them find a
          solution to their problem. We understand that dealing with an issue can
          be frustrating and stressful, so we strive to be helpful every step of
          the way. You can always count on us to go above and beyond to ensure
          that you have a positive experience.
        </p>

        <h3>WHEN WILL MY ORDER SHIP?</h3>
        <p>
          Barring an act of God or an issue with the address on the label, your
          order of FF products will ship within 1-2 business days of being placed.
          We ship all orders from our warehouse in Michigan Monday-Friday. Once
          your order is in the hands of the shipping carrier, the transit time is
          out of our control.
        </p>
        <p>
          Our Freedom Partners' products will ship within 1-5 business days of your
          order being placed and will ship separately from the rest of your FF
          purchase.
        </p>

        <h3>WHAT IF I NEED TO RETURN AN ITEM OR MAKE AN EXCHANGE?</h3>
        <p>
          With the purchase of re:do returns coverage, your eligible items will
          qualify for a free exchange or return for store credit. You can view our
          full policy by clicking{' '}
          <a href="/policies/refund-policy">here</a>. For additional questions or
          concerns or if you received a defective product, the wrong product or if
          an item was missing from your package, drop us an email at{' '}
          <a href="mailto:info@freedomfatigues.com">info@freedomfatigues.com</a>.
        </p>
        <p>
          We answer emails pretty quickly, so if you don't see a reply in your
          inbox within 2 business days, please check your spam folder.
        </p>

        <h3>I RECEIVED AN EMAIL THAT MY ORDER WAS DELIVERED, BUT IT WAS NOT.</h3>
        <p>
          We often see USPS prematurely mark packages as delivered when, in fact,
          they are not. However, when this happens, it's usually an indication
          that delivery will take place soon. Please allow 7-10 business days to
          see if USPS pulls through. If your package still has not arrived at that
          point, please contact the carrier to inquire about its status and
          potentially file a lost package claim.
        </p>

        <h3>CAN YOU SHIP TO AN APO ADDRESS?</h3>
        <p>
          Definitely! The rate applies to the APO facility's zip code in the
          United States. Be sure to enter the country as United States, the city
          as APO or FPO, the state as Armed Forces Europe (AE), Armed Forces
          Pacific (AP), or Armed Forces America (AA), and the APO zip code. The
          tracking information will only tell you when the order gets to the
          facility, then it's in the military's hands to get it there, so please
          be as specific as possible with the unit when filling in the address
          information.
        </p>
      </Section>
    </>
  );
} 