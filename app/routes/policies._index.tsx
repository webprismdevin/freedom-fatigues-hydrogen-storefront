import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import type { ShopPolicy } from '@shopify/hydrogen/storefront-api-types';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import invariant from 'tiny-invariant';

import { PageHeader, Section, Heading, Link } from '~/components';

export const handle = {
  seo: {
    title: 'Policies',
  },
};

export async function loader({ context: { storefront } }: LoaderFunctionArgs) {
  const data = await storefront.query<{
    shop: Record<string, ShopPolicy>;
  }>(POLICIES_QUERY);

  invariant(data, 'No data returned from Shopify API');
  const policies = Object.values(data.shop || {}).filter((policy): policy is ShopPolicy => Boolean(policy));

  if (policies.length === 0) {
    throw new Response('Not found', { status: 404 });
  }

  return json(
    {
      policies,
    },
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export default function Policies() {
  const { policies } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Policies" />
      <Section padding="x" className="mb-24">
        {policies.map((policy) => (
          <Heading className="font-normal text-heading" key={policy.id}>
            <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
          </Heading>
        ))}
      </Section>
    </>
  );
}

const POLICIES_QUERY = `#graphql

  query PoliciesQuery {
    shop {
      privacyPolicy {
            id
    title
    handle
      }
      shippingPolicy {
            id
    title
    handle
      }
      termsOfService {
        id
        title
        handle
      }
      refundPolicy {
        id
        title
        handle
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;
