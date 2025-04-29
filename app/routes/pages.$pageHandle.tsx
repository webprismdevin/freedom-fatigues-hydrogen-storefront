import {
  json,
  type MetaFunction,
  type SerializeFrom,
  type LoaderArgs,
  redirect,
} from '@shopify/remix-oxygen';
import type { Page as PageType } from '@shopify/hydrogen/storefront-api-types';
import { Await, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { PageHeader } from '~/components';
import { Hero } from '~/components/Hero';
import type { SeoHandleFunction } from '@shopify/hydrogen';
import { HERO_FRAGMENT, MODULE_FRAGMENT, sanity } from '~/lib/sanity';
import { Suspense } from 'react';
import Modules from '~/components/Modules';
import useScript from '~/hooks/useScript';

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.shopPage?.seo?.title ?? data?.shopPage?.title,
  description: data?.shopPage?.seo?.description ?? '',
});

export const handle = {
  seo,
};

export async function loader({ request, params, context }: LoaderArgs) {
  invariant(params.pageHandle, 'Missing page handle');

    // Redirect /pages/contact-us to the dedicated contact page route
    if (params.pageHandle === 'contact-us') {
      return redirect('/pages/contact-us');
    }

  const sanityPage = await sanity.fetch(
    `*[_type == 'page' && slug.current == '${params.pageHandle}'][0]{
      _id,
      ${HERO_FRAGMENT},
      ${MODULE_FRAGMENT},
    }`,
  );

  const { page: shopPage } = await context.storefront.query<{ page: PageType }>(
    PAGE_QUERY,
    {
      variables: {
        handle: params.pageHandle,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!shopPage && !sanityPage) {
    throw new Response(null, { status: 404 });
  }

  return json(
    { sanityPage, shopPage },
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export default function Page() {
  const { sanityPage, shopPage } = useLoaderData<typeof loader>();

  useScript('https://unpkg.com/@botpoison/browser');
  useScript('https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js');

  if (sanityPage?._id) return <SanityPage page={sanityPage} />;
  if (shopPage) return <ShopPage page={shopPage} />;
}

function SanityPage({ page }: { page: any }) {
  const { hero, modules } = page;

  return (
    <>
      {page.showHero && <Hero data={hero} />}
      <Suspense>
        <Await resolve={modules}>
          <div
            className={`${page.theme === 'dark' ? 'bg-primary text-contrast' : ''
              }`}
          >
            <Modules modules={modules} />
          </div>
        </Await>
      </Suspense>
    </>
  );
}

function ShopPage({ page }: { page: PageType }) {
  return (
    <PageHeader heading={''}>
      <div
        dangerouslySetInnerHTML={{ __html: page.body }}
        className="prose mx-auto"
      />
    </PageHeader>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
