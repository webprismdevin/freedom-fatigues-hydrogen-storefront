import {
  type ReactNode,
  useRef,
  Suspense,
  useMemo,
  useEffect,
  useState,
} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useFetcher,
  useMatches,
  useNavigation,
  useParams,
} from '@remix-run/react';
import {
  AnalyticsPageType,
  Money,
  ShopifyAnalyticsProduct,
  flattenConnection,
  type SeoHandleFunction,
  type SeoConfig,
  Image,
  ShopPayButton,
  useOptimisticVariant,
} from '@shopify/hydrogen';
import {
  Heading,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
  MediaConnection,
  MediaImage,
  Metafield,
} from '@shopify/hydrogen/storefront-api-types';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import type {Storefront} from '~/lib/type';
import type {Product} from 'schema-dts';
import {fromGID} from '~/lib/gidUtils';
import StarRating from '~/components/StarRating';
import {MODULE_FRAGMENT, sanity, urlFor} from '~/lib/sanity';
import Modules from '~/components/Modules';
import groq from 'groq';
import {SanityImageAssetDocument} from '@sanity/client';
import useScript from '~/hooks/useScript';
import useTags from '~/hooks/useTags';
import {MiniProductCard} from '~/components/ProductCard';
import useFbCookies from '~/hooks/useFbCookies';

const seo: SeoHandleFunction<typeof loader> = ({data}) => {
  const media = flattenConnection<MediaConnection>(data.product.media).find(
    (media) => media.mediaContentType === 'IMAGE',
  ) as MediaImage | undefined;

  return {
    title: data?.product?.seo?.title ?? data?.product?.title,
    media: media?.image,
    description: data?.product?.seo?.description ?? data?.product?.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: data?.product?.vendor,
      name: data?.product?.title,
      description: data?.product?.description,
      image: media?.image?.url,
      offers: {
        '@type': 'Offer',
        price: data?.product?.variants.nodes[0]?.price?.amount,
        priceCurrency: data?.product?.variants.nodes[0]?.price?.currencyCode,
        availability: data?.product?.availableForSale
          ? 'InStock'
          : 'OutOfStock',
        url: data?.product?.url,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data?.product?.avg_rating?.value,
        reviewCount: data?.product.num_reviews?.value,
      },
    },
  } satisfies SeoConfig<Product>;
};

export const handle = {
  seo,
};

type CustomQueryParams = {
  selectedVariant: ProductVariant;
  variants: ProductVariant[];
  caption?: Metafield | undefined;
  fabric_fit?: Metafield | undefined;
  complete_the_look?: Metafield & {
    references: ProductType;
  };
  avg_rating?: Metafield | undefined;
  num_reviews?: Metafield | undefined;
};

type ProductQueryType = {
  product: ProductType & CustomQueryParams;
  shop: Shop;
};

export async function loader({params, request, context}: LoaderArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    if (!name.includes('lid') && !name.includes('utm'))
      selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query<ProductQueryType>(
    PRODUCT_QUERY,
    {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const pageContent =
    await sanity.fetch(`*[_type == 'product' && store.slug.current == '${productHandle}'][0]{
      ${MODULE_FRAGMENT},
      "badges": badges[],
      collective_accordions
    }
  `);

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  
  // Ensure we always have a selectedVariant by defaulting to the first variant if needed
  // This is critical for server-side rendering
  if (!product.selectedVariant) {
    product.selectedVariant = firstVariant;
  }
  
  const selectedVariant = product.selectedVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  return defer({
    product,
    shop,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    // page content specifically for collective
    pageContent,
  });
}

export default function Product() {
  const {product, recommended, pageContent} = useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;
  const {collective_accordions, badges, modules} = pageContent;

  const variants = flattenConnection(product.variants);
  
  // The selectedVariant optimistically changes during page
  // transitions with one of the preloaded product variants
  const selectedVariant = useOptimisticVariant(
    product.selectedVariant,
    variants,
  );

  useScript(
    'https://loox.io/widget/loox.js?shop=freedom-fatigues.myshopify.com',
  );

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
            <section className="flex w-full max-w-xl flex-col gap-8 p-6 md:mx-auto md:max-w-md md:px-0">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold uppercase text-slate-600">
                    {vendor}
                  </div>
                  <div className="bg-red-500 px-2 py-0.5 font-heading text-sm uppercase text-white">
                    Freedom Partner
                  </div>
                </div>
                <Heading
                  as="h1"
                  className="whitespace-normal font-heading text-2xl md:text-3xl lg:text-4xl"
                >
                  {title}
                </Heading>
                {product.caption && (
                  <div className="text-slate-600">{product.caption?.value}</div>
                )}
                <StarRating
                  rating={Number(product.avg_rating?.value)}
                  count={Number(product.num_reviews?.value)}
                />
              </div>
              <ProductForm selectedVariant={selectedVariant} />
              {badges && badges?.length > 0 && <Badges />}
              <div className="grid gap-4 py-4">
                <hr />
                {descriptionHtml && (
                  <>
                    <ProductDetail
                      title="Product Details"
                      content={descriptionHtml}
                    />
                    <hr />
                  </>
                )}
                {product.shipping_dropdown_override && (
                  <>
                    <ProductDetail
                      title="Shipping"
                      content={product.shipping_dropdown_override?.value}
                    />
                    <hr />
                  </>
                )}
                {collective_accordions &&
                  collective_accordions.map(
                    (accordion: {
                      title: string;
                      content: string;
                      learn_more: string;
                    }) => (
                      <>
                        {' '}
                        <ProductDetail
                          title={accordion.title}
                          content={accordion.content}
                          learnMore={accordion.learn_more}
                        />
                        <hr />
                      </>
                    ),
                  )}
                <div className="hidden lg:block">
                  <CompleteTheLook />
                </div>
                {product.num_reviews?.value && (
                  <ResponsiveBrowserWidget breakpoint={768}>
                    <div
                      className="w-full"
                      key={product.id}
                      id="looxReviews"
                      data-product-id={fromGID(product.id)}
                    ></div>
                  </ResponsiveBrowserWidget>
                )}
                <div className="lg:hidden">
                  <CompleteTheLook />
                </div>
              </div>
            </section>
          </div>
        </div>
      </Section>
      {modules && modules?.length > 0 && <Modules modules={modules} />}
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

type Badge = {
  _key: string;
  alt: string;
  asset: SanityImageAssetDocument;
};

const Badges = () => {
  const {pageContent} = useLoaderData<typeof loader>();
  const {badges} = pageContent;

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

let isHydrating = true;

function ResponsiveBrowserWidget({
  breakpoint,
  children,
  greaterThan = false,
}: {
  breakpoint: number;
  children: ReactNode;
  greaterThan?: boolean;
}) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated && greaterThan) {
    return <>{window.innerWidth > breakpoint && children}</>;
  } else if (isHydrated && !greaterThan) {
    return <>{window.innerWidth < breakpoint && children}</>;
  } else {
    return <div>loading...</div>;
  }
}

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
            <MiniProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InlineProductCard({
  product,
}: {
  product: ProductType & CustomQueryParams;
}) {
  const variant = product.variants.nodes[0];

  return (
    <Link to={`/products/${product.handle}`}>
      <div className="grid w-full grid-cols-4 gap-2">
        <div className="card-image col-span-1">
          <Image sizes="128px" src={variant?.image?.url} alt={product.title} />
        </div>
        <div className="col-span-3">
          <StarRating
            rating={Number(product.avg_rating?.value)}
            count={product.num_reviews?.value}
          />
          <div className="text-lg">{product.title}</div>
          <div className="text-sm">${variant.price.amount}</div>
        </div>
      </div>
    </Link>
  );
}

export function ProductForm({selectedVariant}: {selectedVariant: ProductVariant}) {
  const {product, analytics} = useLoaderData<typeof loader>();

  const [root] = useMatches();

  const [currentSearchParams] = useSearchParams();
  const {location} = useNavigation();

  const [fbp, fbc] = useFbCookies();

  /**
   * We update `searchParams` with in-flight request data from `transition` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return location
      ? new URLSearchParams(location.search)
      : currentSearchParams;
  }, [currentSearchParams, location]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Always use the first variant's options.
   */
  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);
    
    // Always apply the first variant's options to the search params
    for (const {name, value} of firstVariant.selectedOptions) {
      if (!clonedParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    if (clonedParams.has('lid')) {
      clonedParams.delete('lid');
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  const isOutOfStock = !selectedVariant?.availableForSale;
  const availableForSale = selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: 1,
  };

  const quantityAvailable = selectedVariant?.quantityAvailable;

  //ATC analytics
  function fireAnalytics() {
    if (window.dataLayer) {
      //@ts-ignore
      window.dataLayer.push({ecommerce: null});
      // @ts-ignore
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'USD',
          value: selectedVariant?.price!.amount,
          items: [
            {
              item_id: fromGID(product.id),
              item_name: product.title,
              affiliation: 'Hydrogen',
              item_brand: 'Freedom Fatigues',
              item_variant: selectedVariant.id,
              price: selectedVariant?.price!.amount,
              quantity: 1,
            },
          ],
        },
      });
    }
    // if (window.TriplePixel)
    //   window.TriplePixel('AddToCart', {item: fromGID(product.id), q: 1});

    if (window.fbq)
      window.fbq(
        'track',
        'AddToCart',
        {
          content_ids: [fromGID(product.id)],
          content_type: 'product',
          value: selectedVariant?.price!.amount,
          currency: 'USD',
        }
      );
  }

  // klaviyo 'viewed product' snippet
  useEffect(() => {

    const item = {
      ProductName: product.title,
      ProductID: product.id,
      ImageURL: firstVariant.image.url,
      URL: `https://freedomfatigues.com/products/${product.handle}`,
      Brand: product.vendor,
      Price: firstVariant.price.amount,
      CompareAtPrice: firstVariant.compareAtPrice?.amount,
    };

    if (window.klaviyo) {
      console.log('klaviyo tracking', item);
      window.klaviyo.track('Viewed Product', item);
    }
  }, [product.id, firstVariant.price.amount, selectedVariant]);

  useEffect(() => {
    // GA4 view_item event
    if (window.dataLayer) {
      window.dataLayer.push({ecommerce: null});
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'USD',
          value: firstVariant.price.amount,
          items: [
            {
              item_id: fromGID(product.id),
              item_name: product.title,
              price: firstVariant.price.amount,
              affiliation: 'Hydrogen Storefront',
              item_brand: product.vendor,
              category: product.productType,
              quantity: 1,
            },
          ],
        },
      });
    }
  }, [product.id, firstVariant.price.amount, selectedVariant]);

  useEffect(() => {
    const value = Number(firstVariant.price.amount);

    const data = {
      content_ids: [fromGID(product.id)],
      content_name: product.title,
      content_type: 'product',
      value,
      currency: 'USD',
    };

    const trackViewContent = () => {
      // facebook pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', data);
      }
    };

    if (typeof window !== 'undefined' && window.fbq) {
      trackViewContent();
    } else {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.fbq) {
          clearInterval(interval);
          trackViewContent();
        }
      }, 100);
    }
  }, [product.id, firstVariant.price.amount, selectedVariant]);

  // klaviyo ATC code
  useEffect(() => {
    const echoCart = async () => {
      try {
        const cartObj = await root.data?.cart;
        
        if (!cartObj?.cost?.totalAmount?.amount || !cartObj?.cost?.subtotalAmount?.amount) {
          console.warn('Cart data is incomplete:', cartObj);
          return;
        }

        const cart = {
          total_price: cartObj.cost.totalAmount.amount,
          $value: cartObj.cost.totalAmount.amount,
          original_total_price: cartObj.cost.subtotalAmount.amount,
          items: cartObj.lines?.nodes || [],
        };

        if (window.klaviyo) {
          console.log('Tracking Klaviyo Add to Cart:', cart);
          window.klaviyo.track('Added to Cart', cart);
        }
      } catch (error) {
        console.error('Error tracking Klaviyo Add to Cart:', error);
      }
    };

    if (root.data?.cart) echoCart();
  }, [root.data?.cart]);

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <ProductOptions
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
          variants={product.variants}
        />
        <div className="grid items-stretch gap-4">
          {!isOutOfStock ? (
            <AddToCartButton
              lines={[
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant: selectedVariant
                },
              ]}
              variant={isOutOfStock ? 'secondary' : 'primary'}
              data-test="add-to-cart"
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
              onClick={fireAnalytics}
            >
              <Text
                as="span"
                className="flex items-center justify-center gap-2"
              >
                <span>Add to Bag</span> <span>·</span>{' '}
                <Money
                  withoutTrailingZeros
                  data={selectedVariant.price}
                  as="span"
                />
                {isOnSale && (
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant.compareAtPrice}
                    as="span"
                    className="strike opacity-50"
                  />
                )}
              </Text>
            </AddToCartButton>
          ) : (
            <BackInStock variant={fromGID(selectedVariant.id)} />
          )}
        </div>
        {/* <div className="flex justify-between">
          <div className="text-xs">{belowCartCopy.left}</div>
          <div className="text-xs">{belowCartCopy.right}</div>
        </div> */}
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

export function ProductOptions({
  options,
  searchParamsWithDefaults,
  variants,
}: {
  options: ProductType['options'];
  searchParamsWithDefaults: URLSearchParams;
  variants: ProductConnection;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      {options
        .filter(
          (option) =>
            option.values.length > 1 && option.values[0] !== 'Default Title',
        )
        .map((option) => (
          <div
            key={option.name}
            className="mb-4 flex flex-col flex-wrap gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {/**
               * First, we render a bunch of <Link> elements for each option value.
               * When the user clicks one of these buttons, it will hit the loader
               * to get the new data.
               *
               * If there are more than 14 values, we render a dropdown.
               * Otherwise, we just render plain links.
               */}
              {option.values.length > 14 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({open}) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex w-full items-center justify-between border border-primary px-4 py-3',
                            open
                              ? 'rounded-b md:rounded-b-none md:rounded-t'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {searchParamsWithDefaults.get(option.name)}
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border border-primary bg-contrast px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-b md:border-t-0',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.values.map((value) => (
                            <Listbox.Option
                              key={`option-${option.name}-${value}`}
                              value={value}
                            >
                              {({active}) => (
                                <ProductOptionLink
                                  optionName={option.name}
                                  optionValue={value}
                                  className={clsx(
                                    'flex w-full cursor-pointer items-center justify-start rounded p-2 text-left text-primary transition',
                                    active && 'bg-contrast/10',
                                  )}
                                  searchParams={searchParamsWithDefaults}
                                  waitForNavigation
                                  onClick={() => {
                                    if (!closeRef?.current) return;
                                    closeRef.current.click();
                                  }}
                                >
                                  {value}
                                  {searchParamsWithDefaults.get(option.name) ===
                                    value && (
                                    <span className="ml-2">
                                      <IconCheck />
                                    </span>
                                  )}
                                </ProductOptionLink>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <Text key={id}>
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          waitForNavigation
                          className={clsx(
                            'cursor-pointer border-[1.5px] p-2 leading-none transition-all duration-200',
                            checked
                              ? 'selected_option !border-primary/50'
                              : '!border-primary/0',
                          )}
                        />
                      </Text>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  waitForNavigation,
  ...props
}: {
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
  children?: ReactNode;
  waitForNavigation?: boolean;
  [key: string]: any;
}) {
  const {pathname} = useLocation();
  const isLangPathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLangPathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link
      {...props}
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
      unstable_viewTransition={waitForNavigation ? false : undefined}
    >
      {children ?? optionValue}
    </Link>
  );
}

export function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'ml-4 flex-shrink-0 transform-gpu transition-transform duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'grid gap-2 pb-4 pt-2'}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="border-b border-primary/30 pb-px text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const DEFAULTS_QUERY = groq`
  *[_id == "settings"][0] {
    product {
      ...,
      ${MODULE_FRAGMENT},
    }
  }`;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    sku
    availableForSale
    selectedOptions {
      name
      value
    }
    quantityAvailable
    image {
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
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      availableForSale
      productType
      tags
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariantFragment
      }
      avg_rating: metafield(namespace: "loox", key: "avg_rating") {
        value
      }
      num_reviews: metafield(namespace: "loox", key: "num_reviews") {
        value
      }
      caption: metafield(namespace: "page", key: "caption") {
        value
      }
      fabric_fit: metafield(namespace: "page", key: "fabric_fit") {
        value
      }
      shipping_dropdown_override: metafield(namespace: "custom", key: "shipping_dropdown_override") {
        value
      }
      complete_the_look: metafield(namespace: "custom", key: "complete_the_look") {
        references(first:10) {
          nodes {
            __typename
            ...ProductCard
          }
        }
      }
      media(first: 14) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
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
`;

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

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    recommended: ProductType[];
    additional: ProductConnection;
  }>(RECOMMENDED_PRODUCTS_QUERY, {
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
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
