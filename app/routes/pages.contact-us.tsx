import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {PageHeader, Section} from '~/components';
import {routeHeaders} from '~/data/cache';
import {ATTR_LOADING_EAGER} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {useState, useEffect} from 'react';

export const headers = routeHeaders;

export async function loader({request, context: {storefront}}: LoaderFunctionArgs) {
  const seo = seoPayload.contact({storefront});
  return json({seo});
}

export default function ContactUs() {
  const {seo} = useLoaderData<typeof loader>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Cloudflare Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://submit-form.com/9WklqL8w', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Form submission error:', err);
    }
  };

  return (
    <>
      <PageHeader heading="Contact Us" />
      <Section padding="all" className="px-4">
        <div className="max-w-[660px] mx-auto">
          <div className="grid gap-4">
            <h2 className="text-lead font-medium">Get in Touch</h2>
            <p>
              Have a question? Need help with an order? Our team is here to help!
            </p>
            {submitted ? (
              <div className="bg-green-100 p-4 rounded">
                <p className="text-green-700">
                  Thank you for your message. We'll get back to you soon!
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                action="https://submit-form.com/9WklqL8w"
                method="POST"
                className="grid gap-4"
              >
                <div>
                  <label htmlFor="name" className="block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div
                  className="cf-turnstile"
                  data-sitekey="0x4AAAAAAAQnuXqGKKH_Kxqw"
                  data-theme="light"
                />

                {error && (
                  <div className="text-red-500">
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded w-full"
                >
                  Send Message
                </button>
              </form>
            )}

            <div className="grid gap-4 mt-6">
              <h2 className="text-lead font-medium">Top FAQs</h2>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">When will my order ship?</h3>
                  <p>
                    Most orders ship within 1-2 business days. Once your order
                    ships, you'll receive a shipping confirmation email with
                    tracking information.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">What is your return policy?</h3>
                  <p>
                    We accept returns within 30 days of delivery. Items must be
                    unworn, unwashed, and have original tags attached.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">How do I exchange an item?</h3>
                  <p>
                    To exchange an item, please return your original item for a
                    refund and place a new order for the desired item.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    Do you ship to APO addresses?
                  </h3>
                  <p>
                    Yes, we proudly ship to APO/FPO addresses. Please note that
                    delivery times may be longer for these addresses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
} 