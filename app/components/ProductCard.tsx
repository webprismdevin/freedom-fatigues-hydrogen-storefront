import clsx from 'clsx';
import {
  flattenConnection,
  Image,
  Money,
  ShopifyAnalyticsProduct,
  useMoney,
} from '@shopify/hydrogen';
import type {SerializeFrom} from '@shopify/remix-oxygen';
import {Text, Link} from '~/components';
import {isDiscounted, isNewArrival, useIsHomePath} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import StarRating from './StarRating';
import useRedo from '~/hooks/useRedo';
import useTags from '~/hooks/useTags';
import QuickAdd from './QuickAdd';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: Product & {
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
  const isHome = useIsHomePath();

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
        <div className="relative overflow-hidden">
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
        </div>
        <Link
          onClick={onClick}
          to={`/products/${product.handle}`}
          prefetch="intent"
        >
          <div className="grid h-12 grid-cols-3 gap-4">
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
        </Link>
        {/* for metafield captions later */}
        <div className="h-14 md:h-10">
          <p className="line-clamp-3 text-sm text-slate-400">
            {product.caption?.value}
          </p>
        </div>
      </div>
      {/* star rating placeholder */}
      <div className="h-4">
        <StarRating
          rating={Number(product.avg_rating?.value)}
          count={Number(product.num_reviews?.value)}
        />
      </div>
      {quickAdd && (
        <QuickAdd
          className={`${
            isHome ? 'border-contrast/20' : 'border-primary/20'
          } mt-2 w-full border-2 py-3 font-medium transition-colors duration-200 hover:bg-FF-red hover:text-white`}
          product={product}
          image={image}
        >
          Quick Add
        </QuickAdd>
      )}
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
    <Link to={`/products/${product.handle}`}>
      <div className="flex gap-4">
        <div className="aspect-square min-w-[128px] max-w-[128px] bg-primary/5">
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
        <div className="flex flex-col gap-2">
          <StarRating
            rating={Number(product.avg_rating?.value)}
            count={Number(product.num_reviews?.value)}
          />
          <p>{product.title}</p>
          <Text className="flex flex-col text-sm md:flex-row md:gap-2">
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
    </Link>
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

export interface RebuyPriceRange {
  max: number;
  min: number;
  isRange: boolean;
}

export function Rebuy_MiniProductCard({
  product,
  className,
}: {
  product: any;
  className?: string;
}) {
  return (
    <div className={className}>
      <Link to={`/products/${product.handle}`}>
        <Image
          src={product.image.src}
          sizes="128px"
          aspectRatio="1/1"
          alt={product.title}
          className="rounded"
        />
        <p className="col-span-2 line-clamp-2 w-full overflow-hidden text-ellipsis text-sm">
          {product.title}
        </p>
      </Link>
      <StarRating rating={product.avg_rating ?? 0} />
      <div className="flex flex-row items-center justify-between">
        <RebuyPriceRange priceRange={product.priceRange} />
        <QuickAdd
          product={product}
          image={product.image.src}
          rebuy
          className="border-0 border-transparent bg-transparent p-0"
        >
          <span className="text-sm">+ ADD</span>
        </QuickAdd>
      </div>
    </div>
  );
}

const RebuyPriceRange = ({priceRange}: {priceRange: RebuyPriceRange}) => {
  function removeCents(dollarAmount: number) {
    if (dollarAmount.toString().endsWith('.00')) {
      return dollarAmount.toString().slice(0, -3); // Remove the last 3 characters (.00)
    }
    return dollarAmount; // Return the original input if it doesn't end with .00
  }

  return (
    <div className="mt-[2px] text-sm font-medium">
      {`$${removeCents(priceRange.min)}${priceRange.isRange ? '+' : ''}`}
    </div>
  );
};
