import {Suspense, useRef, useState} from 'react';
import type {V2_MetaFunction} from '@shopify/remix-oxygen';
import {defer, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import type {FetcherWithComponents} from '@remix-run/react';
import {Await, Link, useFetcher, useLoaderData} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantsQuery,
  ProductVariantFragment,
} from 'storefrontapi.generated';

import {
  Image,
  Money,
  VariantSelector,
  type VariantOption,
  getSelectedProductOptions,
  CartForm,
} from '@shopify/hydrogen';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import {getExcerpt, getVariantUrl} from '~/utils';
import {
  Button,
  Heading,
  IconRedo,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
} from '~/components';
import {
  MEDIA_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_METAFIELD_FRAGMENT,
} from '~/data/fragments';
import ResponsiveBrowserWidget from '~/components/ResponsiveBrowserWidget';
import {fromGID} from '~/lib/gidUtils';
import {MODULE_FRAGMENT, sanity, urlFor} from '~/lib/sanity';
import {SanityImageAssetDocument} from '@sanity/client';
import groq from 'groq';
import StarRating from '~/components/StarRating';
import useRedo from '~/hooks/useRedo';
import useTags from '~/hooks/useTags';
import {ProductDetail} from '~/components/ProductDetail';
import {MiniProductCard_v1} from '~/components/ProductCard';
import Modules from '~/components/Modules';
import invariant from 'tiny-invariant';

export const meta: V2_MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data.product.title}`}];
};

export async function loader({params, request, context}: LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {shop, product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option) => option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      return redirectToFirstVariant({product, request});
    }
  }

  const defaults = await sanity.fetch(DEFAULTS_QUERY);

  const pageContent =
    await sanity.fetch(`*[_type == 'product' && store.slug.current == '${handle}'][0]{
      ${MODULE_FRAGMENT},
      "badges": badges[]
    }
  `);

  const recommended = getRecommendedProducts(context.storefront, product.id);

  return defer({
    shop,
    product,
    variants,
    pageContent,
    defaults,
    recommended,
    modules: pageContent?.modules,
    badgeOverrides: pageContent?.badges,
  });
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductFragment;
  request: Request;
}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  throw redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const {product, variants, modules, recommended, defaults} =
    useLoaderData<typeof loader>();
  const {selectedVariant, media} = product;
  const defaultModules = defaults.product.modules;
  return (
    <>
      <Section className="px-0">
        <div className="grid grid-cols-1 items-start md:grid-cols-2 md:gap-6 lg:grid-cols-5 lg:gap-10">
          <div className="col-span-1 lg:col-span-3">
            <ProductGallery media={media.nodes} />
            {product.num_reviews?.value && (
              <ResponsiveBrowserWidget breakpoint={1024} greaterThan={true}>
                <div
                  className="w-full"
                  key={product.id}
                  id="looxReviews"
                  data-product-id={fromGID(product.id)}
                ></div>
              </ResponsiveBrowserWidget>
            )}
          </div>
          <div className="hiddenScroll sticky md:top-nav md:-mb-nav md:min-h-screen md:-translate-y-nav md:overflow-y-scroll md:pt-nav lg:col-span-2">
            <ProductMain
              selectedVariant={selectedVariant}
              product={product}
              variants={variants}
            />
          </div>
        </div>
      </Section>
      <Modules modules={modules?.length > 0 ? modules : defaultModules} />
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <ProductSwimlane title="You Might Also Like" products={products} />
          )}
        </Await>
      </Suspense>
    </>
  );
}

function ProductImage({image}: {image: ProductVariantFragment['image']}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
}

function ProductMain({
  selectedVariant,

  product,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Promise<ProductVariantsQuery>;
}) {
  const {title, descriptionHtml} = product;
  const {defaults, shop} = useLoaderData<typeof loader>();
  const {
    belowCartCopy,
    lastAccordion,
    modules: defaultModules,
  } = defaults.product;
  const {shippingPolicy, refundPolicy} = shop;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Heading
          as="h1"
          className="whitespace-normal font-heading text-2xl md:text-3xl lg:text-4xl"
        >
          {title}
        </Heading>
        <ProductCaption caption={product.caption} />
        <StarRating
          rating={Number(product.avg_rating?.value)}
          count={Number(product.num_reviews?.value)}
        />
      </div>
      <Suspense
        fallback={
          <ProductForm
            product={product}
            selectedVariant={selectedVariant}
            variants={[]}
          />
        }
      >
        <Await
          errorElement="There was a problem loading product variants"
          resolve={variants}
        >
          {(data) => (
            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              variants={data.product?.variants.nodes || []}
            />
          )}
        </Await>
      </Suspense>
      <div className="flex justify-between">
        <div className="text-xs">{belowCartCopy.left}</div>
        <div className="text-xs">{belowCartCopy.right}</div>
      </div>
      <Badges />
      <div className="grid gap-4 py-4">
        <hr />
        {descriptionHtml && (
          <>
            <ProductDetail title="Product Details" content={descriptionHtml} />
            <hr />
          </>
        )}
        {product.fabric_fit && (
          <>
            <ProductDetail
              title="Fabric + Fit"
              content={product.fabric_fit?.value}
            />
            <hr />
          </>
        )}
        {shippingPolicy?.body && (
          <>
            <ProductDetail
              title="Shipping"
              content={getExcerpt(shippingPolicy.body)}
              learnMore={`/policies/${shippingPolicy.handle}`}
            />
            <hr />
          </>
        )}
        {refundPolicy?.body && (
          <>
            <ProductDetail
              title="Returns + Exchanges"
              content={getExcerpt(refundPolicy.body)}
              learnMore={`/policies/${refundPolicy.handle}`}
            />
            <hr />
          </>
        )}
        <ProductDetail
          title="Supporting Veterans + First Responders"
          content={lastAccordion}
        />
        <hr />
        <div className="hidden lg:block">
          <CompleteTheLook />
        </div>
        <ResponsiveBrowserWidget breakpoint={768}>
          <div
            className="w-full"
            key={product.id}
            id="looxReviews"
            data-product-id={fromGID(product.id)}
          ></div>
        </ResponsiveBrowserWidget>
        <div className="lg:hidden">
          <CompleteTheLook />
        </div>
      </div>
    </div>
  );
}

function ProductPrice({
  selectedVariant,
}: {
  selectedVariant: ProductFragment['selectedVariant'];
}) {
  return (
    <div className="product-price">
      {selectedVariant?.compareAtPrice ? (
        <>
          <p>Sale</p>
          <br />
          <div className="product-price-on-sale">
            {selectedVariant ? <Money data={selectedVariant.price} /> : null}
            <s>
              <Money data={selectedVariant.compareAtPrice} />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && <Money data={selectedVariant?.price} />
      )}
    </div>
  );
}

function ProductForm({
  product,
  selectedVariant,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Array<ProductVariantFragment>;
}) {
  return (
    <div className="grid gap-4">
      <VariantSelector
        handle={product.handle}
        options={product.options}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      <StockCounter
        quantityAvailable={selectedVariant?.quantityAvailable ?? 0}
        availableForSale={selectedVariant?.availableForSale}
      />
      <RedoCheckbox product={product} />
      {selectedVariant.availableForSale ? (
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            window.location.href = window.location.href + '#cart-aside';
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]
              : []
          }
        >
          <span className="flex items-center justify-center gap-2">
            <span>Add to Bag</span> <span>·</span>
            <Money
              withoutTrailingZeros
              data={selectedVariant?.price!}
              as="span"
            />
            {selectedVariant?.compareAtPrice && (
              <Money
                withoutTrailingZeros
                data={selectedVariant?.compareAtPrice!}
                as="span"
                className="strike opacity-50"
              />
            )}
          </span>
        </AddToCartButton>
      ) : null}
      {!selectedVariant.availableForSale ? (
        <BackInStock variant={fromGID(selectedVariant.id)} />
      ) : null}
    </div>
  );
}

function ProductOptions({option}: {option: VariantOption}) {
  return (
    <div
      className="mb-4 flex flex-col flex-wrap gap-y-2 last:mb-0"
      key={option.name}
    >
      <h5 className="font-bold min-w-[4rem]">
        {option.name}
      </h5>
      <div className="flex flex-wrap items-baseline gap-4">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="cursor-pointer border-[1.5px] p-2 leading-none transition-all duration-200"
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                border: isActive ? '1px solid black' : '1px solid transparent',
                opacity: isAvailable ? 1 : 0.3,
              }}
            >
              {value}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function BackInStock({variant}: {variant: any}) {
  const backinstock = useFetcher();
  const ref = useRef(null);

  return (
    <div>
      <backinstock.Form ref={ref} method="post" action="/backinstock/notify">
        <p className="grow py-2 font-bold">
          Get notified when this item is back in stock
        </p>
        <div className="flex">
          <input type="hidden" value={variant} name="variant" />
          <input
            type="email"
            placeholder="Enter email address"
            name="email"
            className="grow border-b-2 border-b-black bg-transparent px-4 py-2"
          />
          <Button variant="primary">Notify Me</Button>
        </div>
        {backinstock.state === 'idle' && backinstock.data ? (
          backinstock.data.ok ? (
            <p>We&apos;ll let you know once we restock!</p>
          ) : (
            <p className="text-red-500">
              Something went wrong. We&apos;re looking into it!
            </p>
          )
        ) : null}
      </backinstock.Form>
    </div>
  );
}

export function RedoCheckbox({product}: {product: ProductFragment}) {
  const redoBox = useRef(null);
  const [redo, setRedo] = useState(true);

  const [isRedoInCart] = useRedo();

  const isClearance = useTags(product.tags, 'Clearance');

  return (
    <>
      {product.selectedVariant.availableForSale &&
        !isRedoInCart &&
        !isClearance && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              ref={redoBox}
              onChange={(e) => setRedo(e.target.checked)}
              checked={redo}
            />
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px]">
                Get free returns for store credit, or exchange, for $1 via re:do
              </span>
            </div>
          </div>
        )}
    </>
  );
}

export function ProductCaption({caption}: {caption: {value: string}}) {
  if (caption) return <div className="text-slate-600">{caption.value}</div>;
}

export function StockCounter({
  quantityAvailable,
  availableForSale,
}: {
  quantityAvailable: number;
  availableForSale: boolean | null;
}) {
  return (
    <div>
      {availableForSale !== false &&
        quantityAvailable < 20 &&
        quantityAvailable > 0 && (
          <div className={`${quantityAvailable < 10 ? 'text-red-500' : ''}`}>
            {quantityAvailable < 10 && <span>Only&nbsp;</span>}
            <span className="font-bold">{quantityAvailable}&nbsp;</span>
            left in this size
          </div>
        )}
    </div>
  );
}

function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: CartLineInput[];
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </Button>
        </>
      )}
    </CartForm>
  );
}

type Badge = {
  _key: string;
  alt: string;
  asset: SanityImageAssetDocument;
};

const Badges = () => {
  const {defaults, badgeOverrides} = useLoaderData<typeof loader>();

  const defaultBadges = defaults.product.badges;

  // const badges = badgeOverrides ?? defaultBadges;

  const badges = badgeOverrides
    ? [
        ...badgeOverrides,
        ...defaults.product.badges.slice(
          badgeOverrides.length,
          defaultBadges.length,
        ),
      ]
    : defaultBadges;

  return (
    <div className="flex flex-wrap justify-between gap-2">
      {badges.map((badge: Badge) => (
        <Image
          sizes="(max-width: 639px) 64px, 80px"
          className="max-w-[64px] flex-grow-0 md:max-w-[80px]"
          src={urlFor(badge.asset).format('webp').height(96).quality(100).url()}
          alt={badge.alt}
          key={badge._key}
        />
      ))}
    </div>
  );
};

function CompleteTheLook() {
  const {product} = useLoaderData<typeof loader>();

  if (!product.complete_the_look) return null;

  return (
    <div>
      <h3 className="my-4 text-center font-heading text-3xl font-bold uppercase md:text-3xl">
        Complete The Look
      </h3>
      <div className={`mx-auto grid max-w-xl grid-cols-1 gap-4`}>
        {product?.complete_the_look?.references.nodes.map((product: any) => (
          <div key={product.id}>
            {/* <InlineProductCard product={product} /> */}
            <MiniProductCard_v1 product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    quantityAvailable
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_METAFIELD_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    tags
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
    media(first: 14) {
      nodes {
        ...Media
      }
    }
    ...Metafields
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    shop {
      name
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  } 
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
` as const;

const DEFAULTS_QUERY = groq`
  *[_id == "settings"][0] {
    product {
      ...,
      ${MODULE_FRAGMENT},
    }
  }`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

async function getRecommendedProducts(storefront, productId) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
