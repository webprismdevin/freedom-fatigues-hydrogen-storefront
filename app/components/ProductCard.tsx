import {QuickAdd} from './QuickAdd';
import clsx from 'clsx';
import {
  flattenConnection,
  Image,
  Money,
  ShopifyAnalyticsProduct,
  useMoney,
} from '@shopify/hydrogen';
import type {SerializeFrom} from '@shopify/remix-oxygen';
import {Text, Link, AddToCartButton, Button} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import type {
  MoneyV2,
  Product,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';
import StarRating from './StarRating';
import {AnimatePresence, motion, useCycle} from 'framer-motion';
import {useState} from 'react';
import {Listbox} from '@headlessui/react';
import useRedo from '~/hooks/useRedo';
import useTags from '~/hooks/useTags';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: SerializeFrom<Product> & {
    caption?: {value: string};
    avg_rating?: {value: string};
    num_reviews?: {value: string};
    options: {name: string; values: string[]}[];
  };
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel;
  const [isRedoInCart] = useRedo();
  const isClearance = useTags(product.tags, 'Clearance');

  const [hovered, setHovered] = useState(false);
  const [shown, cycleShown] = useCycle(false, true);
  const [showOptions, cycleOptions] = useCycle(false, true);
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | (() => void)
  >(() => {
    return product.variants.nodes.find((variant) => variant.availableForSale);
  });

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={clsx('grid gap-4', className)}>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => cycleShown(1)}
          onMouseLeave={() => cycleShown(0)}
        >
          <Link
            onClick={onClick}
            to={`/products/${product.handle}`}
            prefetch="intent"
          >
            <div className="card-image relative aspect-square bg-primary/5">
              {image && (
                <Image
                  className="fadeIn aspect-[4/5] w-full object-cover"
                  sizes="320px"
                  aspectRatio="1/1"
                  data={image}
                  alt={image.altText || `Picture of ${product.title}`}
                  loading={loading}
                />
              )}
              {cardLabel && (
                <span className="absolute right-0 top-0 m-4 rounded-full bg-FF-red px-2 py-1 text-right text-xs text-white">
                  {cardLabel}
                </span>
              )}
            </div>
          </Link>
          {quickAdd && (
            <div className="hidden md:block">
              <AnimatePresence>
                {product.variants.nodes.length > 1 &&
                  shown &&
                  product.availableForSale && (
                    <motion.div
                      initial={{y: '110%'}}
                      animate={{y: 0}}
                      exit={{y: '110%'}}
                      onMouseEnter={() => cycleOptions(1)}
                      onMouseLeave={() => cycleOptions(0)}
                      className="absolute bottom-2 left-2 right-2 z-10 rounded-md bg-white p-4 text-primary shadow"
                    >
                      {!showOptions && product.variants.nodes.length > 1 ? (
                        <motion.p className="text-center font-bold">
                          Quick Add
                        </motion.p>
                      ) : null}
                      {product.variants.nodes.length > 1 && showOptions ? (
                        <>
                          {product.options.length === 1 && (
                            <motion.div className="flex justify-center gap-2">
                              {product.variants.nodes.map((variant) => (
                                <AddToCartButton
                                  disabled={!variant.availableForSale}
                                  className={`bg-transparent ${
                                    variant.availableForSale
                                      ? 'hover:bg-red-500 hover:text-white'
                                      : 'text-gray-300 line-through '
                                  } rounded-sm px-1 py-0`}
                                  analytics={{
                                    products: [
                                      {
                                        productGid: product.id,
                                        variantGid: variant.id,
                                        name: product.title,
                                        variantName: variant.title,
                                        brand: product.vendor,
                                        price: variant.price.amount,
                                        quantity: 1,
                                      },
                                    ],
                                    totalValue: parseFloat(
                                      productAnalytics.price,
                                    ),
                                  }}
                                  key={variant.id}
                                  data-test="add-to-cart"
                                  lines={
                                    isRedoInCart || isClearance
                                      ? [
                                          {
                                            quantity: 1,
                                            merchandiseId: variant.id,
                                          },
                                        ]
                                      : [
                                          {
                                            quantity: 1,
                                            merchandiseId: variant.id,
                                          },
                                          {
                                            merchandiseId:
                                              'gid://shopify/ProductVariant/40053085339766',
                                            quantity: 1,
                                          },
                                        ]
                                  }
                                >
                                  <p>{variant.title}</p>
                                </AddToCartButton>
                              ))}
                            </motion.div>
                          )}
                        </>
                      ) : null}
                    </motion.div>
                  )}
                {product.variants.nodes.length === 1 &&
                  shown &&
                  product.availableForSale && (
                    <motion.div
                      initial={{y: '110%'}}
                      animate={{y: 0}}
                      exit={{y: '110%'}}
                      onMouseEnter={() => cycleOptions(1)}
                      onMouseLeave={() => cycleOptions(0)}
                      className="absolute bottom-2 left-2 right-2 z-10 rounded-md bg-white p-4 text-primary shadow hover:bg-red-500 hover:text-white"
                    >
                      <AddToCartButton
                        className="bg-transparent px-1 py-0"
                        analytics={{
                          products: [
                            {
                              productGid: product.id,
                              variantGid: product.variants.nodes[0].id,
                              name: product.title,
                              variantName: product.variants.nodes[0].title,
                              brand: product.vendor,
                              price: product.variants.nodes[0].price.amount,
                              quantity: 1,
                            },
                          ],
                          totalValue: parseFloat(productAnalytics.price),
                        }}
                        key={product.variants.nodes[0].id}
                        data-test="add-to-cart"
                        lines={
                          isRedoInCart || isClearance
                            ? [
                                {
                                  quantity: 1,
                                  merchandiseId: product.variants.nodes[0].id,
                                },
                              ]
                            : [
                                {
                                  quantity: 1,
                                  merchandiseId: product.variants.nodes[0].id,
                                },
                                {
                                  merchandiseId:
                                    'gid://shopify/ProductVariant/40053085339766',
                                  quantity: 1,
                                },
                              ]
                        }
                      >
                        <p className="font-bold">Quick Add</p>
                      </AddToCartButton>
                    </motion.div>
                  )}
                {product.variants.nodes.length === 1 &&
                  shown &&
                  !product.availableForSale && (
                    <motion.div
                      initial={{y: '110%'}}
                      animate={{y: 0}}
                      exit={{y: '110%'}}
                      onMouseEnter={() => cycleOptions(1)}
                      onMouseLeave={() => cycleOptions(0)}
                      className="absolute bottom-2 left-2 right-2 z-10 rounded-md bg-white text-primary shadow hover:bg-black hover:text-white"
                    >
                      <Link
                        onClick={onClick}
                        to={`/products/${product.handle}`}
                        prefetch="intent"
                      >
                        <p className="p-4 text-center font-bold">
                          Out of stock. Get notified.
                        </p>
                      </Link>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Text
            className="col-span-2 line-clamp-2 w-full overflow-hidden text-ellipsis"
            as="h3"
          >
            {product.title}
          </Text>
          <div className="flex place-items-start justify-end gap-4">
            <Text className="flex flex-col md:flex-row md:gap-2">
              <Money withoutTrailingZeros data={price!} />
              {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                <CompareAtPrice
                  className={'opacity-50'}
                  data={compareAtPrice as MoneyV2}
                />
              )}
            </Text>
          </div>
        </div>
        {/* for metafield captions later */}
        <div>
          <p className="text-sm text-slate-400">{product.caption?.value}</p>
          {/* <p className="text-sm text-slate-400">Do elit proident.</p> */}
        </div>
      </div>
      {/* star rating placeholder */}
      <div className="h-4">
        <StarRating
          rating={Number(product.avg_rating?.value)}
          count={Number(product.num_reviews?.value)}
        />
      </div>
      {/* </Link> */}
    </div>
  );
}

export function MiniProductCard({
  product,
  label,
  className,
  loading,
  onClick,
}: {
  product: SerializeFrom<Product> & {
    caption?: {value: string};
    avg_rating?: {value: string};
    num_reviews?: {value: string};
  };
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
}) {
  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  return (
    <div className="flex">
      <div className="aspect-square bg-primary/5">
        {image && (
          <Image
            className="fadeIn aspect-[4/5] w-full object-cover"
            sizes="320px"
            aspectRatio="1/1"
            data={image}
            alt={image.altText || `Picture of ${product.title}`}
            loading={loading}
          />
        )}
      </div>
      <div>
        <StarRating
          rating={Number(product.avg_rating?.value)}
          count={Number(product.num_reviews?.value)}
        />
        <p>{product.title}</p>
        <Text className="flex flex-col md:flex-row md:gap-2">
          <Money withoutTrailingZeros data={price!} />
          {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
            <CompareAtPrice
              className={'opacity-50'}
              data={compareAtPrice as MoneyV2}
            />
          )}
        </Text>
      </div>
    </div>
  );
}

export type ProductRating = {
  rating: number;
  reviewCount: number;
};

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}

export function Rebuy_MiniProductCard({
  product,
}: {
  product: any;
}){

  const num_reviews = product.metafields.find((metafield: any) => metafield.key === 'num_reviews').value;
  const avg_rating = product.metafields.find((metafield: any) => metafield.key === 'avg_rating').value;
  const caption = product.metafields.find((metafield: any) => metafield.key === 'caption').value;

  const maxPrice = product.variants.reduce((max, variant) => {
    return variant.price > max ? variant.price : max;
  }, 0);

  const minPrice = product.variants.reduce((min, variant) => {
    return variant.price < min ? variant.price : min;
  }, Infinity);

  const isRange = maxPrice !== minPrice;

  const priceRange:RebuyPriceRange = {
    max: maxPrice,
    min: minPrice,
    isRange: isRange,
  };

  return <div key={product.admin_graph_ql_api_id}>
    <Image 
      src={product.image.src}
      sizes='128px'
      aspectRatio='1/1'
      alt={product.title}
    />
    <p
      className="text-sm col-span-2 line-clamp-3 w-full overflow-hidden text-ellipsis"
    >
      {product.title}
    </p>
    <p className="text-sm text-slate-400">{product.caption?.value}</p>
    <StarRating rating={avg_rating} />
    <RebuyPriceRange priceRange={priceRange} />
    </div>
}

const RebuyPriceRange = ({priceRange}: {priceRange: RebuyPriceRange}) => {
  
  return <div>${priceRange.min}&nbsp;{priceRange.isRange && `- $${priceRange.max}`}</div>
}