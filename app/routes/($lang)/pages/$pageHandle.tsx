import {
  json,
  type MetaFunction,
  type SerializeFrom,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import {Await, useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {PageHeader} from '~/components';
import {Hero} from '~/components/Hero';
import type {SeoHandleFunction} from '@shopify/hydrogen';
import {HERO_FRAGMENT, MODULE_FRAGMENT, sanity} from '~/lib/sanity';
import {Suspense} from 'react';
import Modules from '~/components/Modules';

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.page?.seo?.title,
  description: data?.page?.seo?.description,
});

export const handle = {
  seo,
};

export async function loader({request, params, context}: LoaderArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  const sanityPage = await sanity.fetch(
    `*[_type == 'page' && slug.current == '${params.pageHandle}'][0]{
      ${HERO_FRAGMENT},
      ${MODULE_FRAGMENT},
    }`,
  );

  const {page: shopPage} = await context.storefront.query<{page: PageType}>(
    PAGE_QUERY,
    {
      variables: {
        handle: params.pageHandle,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!shopPage && !sanityPage) {
    throw new Response(null, {status: 404});
  }

  return json(
    {sanityPage, shopPage},
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export default function Page() {
  const {sanityPage, shopPage} = useLoaderData<typeof loader>();

  if (sanityPage && !shopPage) return <SanityPage page={sanityPage} />;
  if (shopPage) return <ShopPage page={shopPage} />;
}

function SanityPage({page}: {page: any}) {
  const {hero, modules} = page;

  return (
    <>
      {page.showHero && <Hero data={hero} />}
      <Suspense>
        <Await resolve={modules}>
          <div
            className={`py-10 ${
              page.theme === 'dark' ? 'bg-primary text-contrast' : ''
            }`}
          >
            <Modules modules={modules} />
          </div>
        </Await>
      </Suspense>
    </>
  );
}

function ShopPage({page}: {page: PageType}) {
  return (
    <PageHeader heading={""}>
      <div
        dangerouslySetInnerHTML={{__html: page.body}}
        className="prose mx-auto dark:prose-invert"
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
