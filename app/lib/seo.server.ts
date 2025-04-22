import {Storefront} from '@shopify/hydrogen';
import type {
  Article,
  Blog,
  Collection,
  CollectionConnection,
  Maybe,
  Page,
  Product,
  ProductVariant,
  Shop,
  ShopPolicy,
} from '@shopify/hydrogen-react/storefront-api-types';
import type {
  WithContext,
  Article as SeoArticle,
  BreadcrumbList,
  CollectionPage,
  Organization,
  Product as SeoProduct,
  WebPage,
  Offer,
  Blog as SeoBlog,
} from 'schema-dts';

export type SeoConfig<T = WebPage> = {
  title?: string;
  titleTemplate?: string;
  description?: string;
  handle?: string;
  url?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  media?: {
    type: string;
    url?: string;
    height?: string;
    width?: string;
    altText?: string;
  };
  jsonLd?: WithContext<Organization | WebPage | BreadcrumbList | SeoArticle | SeoProduct | CollectionPage>;
};

export type SeoConfigReturn = SeoConfig;

function root({
  shop,
  url,
}: {
  shop: Shop;
  url: Request['url'];
}): SeoConfigReturn {
  return {
    title: shop?.name,
    titleTemplate: '%s | ' + shop?.name,
    description: truncate(shop?.description ?? ''),
    media: {
      type: 'logo',
      url: shop?.brand?.logo?.image?.url ?? '',
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: shop.name,
      url: new URL(url).origin,
      logo: shop.brand?.logo?.image?.url,
    },
  };
}

function home(): SeoConfig<WebPage> {
  return {
    title: 'Home',
    titleTemplate: '%s | Hydrogen Demo Store',
    description: 'The best place to buy snowboarding products',
    robots: {
      noIndex: false,
      noFollow: false,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Home page',
    },
  };
}

function productJsonLd({
  product,
  selectedVariant,
  url,
}: {
  product: Product;
  selectedVariant: ProductVariant;
  url: Request['url'];
}): SeoConfig<SeoProduct | BreadcrumbList>['jsonLd'] {
  const origin = new URL(url).origin;
  const variants = product.variants.nodes;
  const description = truncate(
    product?.seo?.description ?? product?.description,
  );
  const offers: Offer[] = (variants || []).map((variant) => {
    const variantUrl = new URL(url);
    for (const option of variant.selectedOptions) {
      variantUrl.searchParams.set(option.name, option.value);
    }
    const availability = variant.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    return {
      '@type': 'Offer',
      availability,
      price: parseFloat(variant.price.amount),
      priceCurrency: variant.price.currencyCode,
      sku: variant?.sku ?? '',
      url: variantUrl.toString(),
    };
  });
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Products',
          item: `${origin}/products`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.title,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: {
        '@type': 'Brand',
        name: product.vendor,
      },
      description,
      image: [selectedVariant?.image?.url ?? ''],
      name: product.title,
      offers,
      sku: selectedVariant?.sku ?? '',
      url,
    },
  ];
}

function product({
  product,
  selectedVariant,
  url,
}: {
  product: Product;
  selectedVariant: ProductVariant;
  url: Request['url'];
}): SeoConfigReturn {
  const jsonLd: WithContext<SeoProduct> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    brand: {
      '@type': 'Brand',
      name: product.vendor ?? '',
    },
    description: truncate(product?.description ?? ''),
    image: [selectedVariant?.image?.url ?? product?.featuredImage?.url ?? ''],
    name: product.title ?? '',
    url,
    offers: {
      '@type': 'Offer',
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      price: selectedVariant?.price?.amount ?? '',
      priceCurrency: selectedVariant?.price?.currencyCode ?? '',
    },
  };

  return {
    title: product?.title ?? undefined,
    description: truncate(product?.description ?? ''),
    titleTemplate: '%s | Product',
    url,
    media: {
      type: 'image',
      url: selectedVariant?.image?.url ?? product?.featuredImage?.url ?? undefined,
      height: selectedVariant?.image?.height?.toString() ?? product?.featuredImage?.height?.toString() ?? undefined,
      width: selectedVariant?.image?.width?.toString() ?? product?.featuredImage?.width?.toString() ?? undefined,
      altText: selectedVariant?.image?.altText ?? product?.featuredImage?.altText ?? undefined,
    },
    jsonLd,
  };
}

function collectionJsonLd({
  url,
  collection,
}: {
  url: Request['url'];
  collection: Collection;
}): SeoConfig<CollectionPage | BreadcrumbList>['jsonLd'] {
  const siteUrl = new URL(url);
  const itemListElement: CollectionPage['mainEntity'] =
    collection.products.nodes.map((product, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `/products/${product.handle}`,
      };
    });

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Collections',
          item: `${siteUrl.host}/collections`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: collection.title,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection?.seo?.title ?? collection?.title ?? '',
      description: truncate(
        collection?.seo?.description ?? collection?.description ?? '',
      ),
      image: collection?.image?.url,
      url: `/collections/${collection.handle}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement,
      },
    },
  ];
}

function collection({
  collection,
  url,
}: {
  collection: Collection;
  url: Request['url'];
}): SeoConfigReturn {
  const jsonLd: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection?.title ?? '',
    description: truncate(collection?.description ?? ''),
    image: collection?.image?.url ?? undefined,
    url,
  };

  return {
    title: collection?.title ?? undefined,
    description: truncate(collection?.description ?? ''),
    titleTemplate: '%s | Collection',
    url,
    noIndex: false,
    media: {
      type: 'image',
      url: collection?.image?.url ?? undefined,
      height: collection?.image?.height?.toString() ?? undefined,
      width: collection?.image?.width?.toString() ?? undefined,
      altText: collection?.image?.altText ?? undefined,
    },
    jsonLd,
  };
}

function collectionsJsonLd({
  url,
  collections,
}: {
  url: Request['url'];
  collections: CollectionConnection;
}): SeoConfig<CollectionPage>['jsonLd'] {
  const itemListElement: CollectionPage['mainEntity'] = collections.nodes.map(
    (collection, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `/collections/${collection.handle}`,
      };
    },
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Collections',
    description: 'All collections',
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement,
    },
  };
}

function listCollections({
  collections,
  url,
}: {
  collections: CollectionConnection;
  url: Request['url'];
}): SeoConfig<CollectionPage> {
  return {
    title: 'Collections',
    titleTemplate: '%s | Collections',
    description: 'All hydrogen collections',
    url,
    jsonLd: collectionsJsonLd({collections, url}),
  };
}

function article({
  article,
  blog,
  url,
}: {
  article: Article;
  blog: Blog;
  url: Request['url'];
}): SeoConfigReturn {
  const jsonLd: WithContext<SeoArticle> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article?.title ?? '',
    description: truncate(article?.content ?? ''),
    image: article?.image?.url ?? undefined,
    datePublished: article?.publishedAt ?? '',
    dateModified: article?.publishedAt ?? '',
    author: {
      '@type': 'Person',
      name: article?.author?.name ?? '',
    },
  };

  return {
    title: article?.title ?? undefined,
    description: truncate(article?.content ?? ''),
    titleTemplate: '%s | Blog',
    url,
    media: {
      type: 'image',
      url: article?.image?.url ?? undefined,
      height: article?.image?.height?.toString() ?? undefined,
      width: article?.image?.width?.toString() ?? undefined,
      altText: article?.image?.altText ?? undefined,
    },
    jsonLd,
  };
}

function blog({
  blog,
  url,
}: {
  blog: Blog;
  url: Request['url'];
}): SeoConfig<SeoBlog> {
  return {
    title: blog?.seo?.title,
    description: truncate(blog?.seo?.description || ''),
    titleTemplate: '%s | Blog',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: blog?.seo?.title || blog?.title || '',
      description: blog?.seo?.description || '',
      url,
    },
  };
}

function page({
  page,
  url,
}: {
  page: Page;
  url: Request['url'];
}): SeoConfig<WebPage> {
  return {
    description: truncate(page?.seo?.description || ''),
    title: page?.seo?.title,
    titleTemplate: '%s | Page',
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
    },
  };
}

function policy({
  policy,
  url,
}: {
  policy: ShopPolicy;
  url: Request['url'];
}): SeoConfigReturn {
  return {
    title: policy?.title,
    description: truncate(policy?.body ?? ''),
    titleTemplate: '%s | ' + policy?.title,
    url,
    noIndex: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url,
    },
  };
}

function policies({
  policies,
  url,
}: {
  policies: ShopPolicy[];
  url: Request['url'];
}): SeoConfigReturn {
  const origin = new URL(url).origin;
  const itemListElement: BreadcrumbList['itemListElement'] = policies
    .filter(Boolean)
    .map((policy, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: policy.title,
        item: `${origin}/policies/${policy.handle}`,
      };
    });

  return {
    title: 'Policies',
    description: 'Policies',
    titleTemplate: '%s | Policies',
    url,
    noIndex: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    },
  };
}

function contact({storefront}: {storefront: Storefront}) {
  return {
    title: 'Contact Us - Freedom Fatigues',
    description: 'Get in touch with our customer service team. We\'re here to help with orders, returns, exchanges, and any other questions you may have.',
    titleTemplate: '%s',
    url: '/contact-us',
  };
}

export const seoPayload = {
  article,
  blog,
  collection,
  home,
  listCollections,
  page,
  policies,
  policy,
  product,
  root,
  contact,
};

/**
 * Truncate a string to a given length, adding an ellipsis if it was truncated
 * @param str - The string to truncate
 * @param num - The maximum length of the string
 * @returns The truncated string
 * @example
 * ```js
 * truncate('Hello world', 5) // 'Hello...'
 * ```
 */
function truncate(str: string, num = 155): string {
  if (typeof str !== 'string') return '';
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num - 3) + '...';
}
