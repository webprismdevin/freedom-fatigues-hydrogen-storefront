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
  };
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel;

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
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-square bg-primary/5">
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
      </Link>
      {quickAdd
        ? QuickAddOptions(product, firstVariant, productAnalytics)
        : null}
    </div>
  );
}

import {useState} from 'react';

function QuickAddOptions(
  product: Product,
  firstVariant: ProductVariant,
  productAnalytics: ShopifyAnalyticsProduct,
) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  return (
    <>
      <div className="h-11">
        {product.variants.nodes.length > 1 ? (
          <select
            className="w-full bg-transparent"
            value={selectedVariant?.title ?? ''}
            onChange={(event) => {
              const variant = product.variants?.nodes?.find(
                (variant) => variant.title === event.target.value,
              );
              setSelectedVariant(variant ?? null);
              if (variant) {
                productAnalytics.variantName = variant.title;
                productAnalytics.variantId = variant.id;
              }
            }}
          >
            <option value="">Select a size</option>
            {product.variants?.nodes?.map((variant) => (
              <option
                key={variant.id}
                value={variant.title}
                disabled={!variant.availableForSale}
              >
                {variant.title} {variant.availableForSale ? '' : ' - Sold Out'}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <AddToCartButton
        lines={[
          {
            quantity: 1,
            merchandiseId: selectedVariant?.id ?? firstVariant.id,
          },
        ]}
        variant="secondary"
        className="mt-2"
        analytics={{
          products: [productAnalytics],
          totalValue: parseFloat(productAnalytics.price),
        }}
        disabled={!selectedVariant && !firstVariant.availableForSale}
      >
        <Text as="span" className="flex items-center justify-center gap-2">
          Add to Bag
        </Text>
      </AddToCartButton>
    </>
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
