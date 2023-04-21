import clsx from 'clsx';
import {
  flattenConnection,
  Image,
  Money,
  ShopifyAnalyticsProduct,
  useMoney,
} from '@shopify/hydrogen';
import type {SerializeFrom} from '@shopify/remix-oxygen';
import {Text, Link, AddToCartButton} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
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
          <div className="card-image aspect-[4/5] bg-primary/5">
            {image && (
              <Image
                className="fadeIn aspect-[4/5] w-full object-cover"
                sizes="320px"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute right-0 top-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <Text
              className="col-span-2 w-full overflow-hidden text-ellipsis"
              as="h3"
            >
              {product.title}
            </Text>
            <div className="flex place-items-start justify-end gap-4">
              <Text className="flex gap-4">
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
        <div>
          <StarRating
            rating={Number(product.avg_rating?.value)}
            count={Number(product.num_reviews?.value)}
          />
        </div>
      </Link>
      {quickAdd && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Bag
          </Text>
        </AddToCartButton>
      )}
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
