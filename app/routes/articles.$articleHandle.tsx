import {
  json,
  type V2_MetaFunction,
  type SerializeFrom,
  type LinksFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {Blog} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {PageHeader, Section} from '~/components';
import {ATTR_LOADING_EAGER} from '~/lib/const';
// import styles from '../../../styles/custom-font.css';
import type {SeoHandleFunction} from '@shopify/hydrogen';

const BLOG_HANDLE = 'articles';

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.article?.seo?.title ?? data?.article?.title,
  description: data?.article?.seo?.description ?? data?.article?.excerpt,
  titleTemplate: '%s',
});

export const handle = {
  seo,
};

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  invariant(params.articleHandle, 'Missing journal handle');

  const {blog} = await context.storefront.query<{
    blog: Blog;
  }>(ARTICLE_QUERY, {
    variables: {
      blogHandle: BLOG_HANDLE,
      articleHandle: params.articleHandle,
      language,
    },
  });

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  const article = blog.articleByHandle;

  const formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article?.publishedAt!));

  return json(
    {article, formattedDate},
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export const meta: V2_MetaFunction = ({
  data,
}: {
  data: SerializeFrom<typeof loader> | undefined;
}) => {
  return [
    {title: data?.article?.seo?.title ?? data?.article?.title},
    {description: data?.article?.seo?.description ?? data?.article?.excerpt},
  ];
};

// export const links: LinksFunction = () => {
//   // return [{rel: 'stylesheet', href: styles}];
// };

export default function Article() {
  const {article, formattedDate} = useLoaderData<typeof loader>();

  const {title, image, contentHtml, author} = article;

  return (
    <>
      <PageHeader heading={title} variant="blogPost">
        <span>{formattedDate}</span>
      </PageHeader>
      <Section as="article" padding="x">
        {image && (
          <Image
            data={image}
            className="mx-auto mt-8 w-full max-w-7xl md:mt-16"
            sizes="90vw"
            loading={ATTR_LOADING_EAGER}
          />
        )}
        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="article"
        />
      </Section>
    </>
  );
}

const ARTICLE_QUERY = `#graphql
  query ArticleDetails(
    $language: LanguageCode
    $blogHandle: String!
    $articleHandle: String!
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        excerpt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;
