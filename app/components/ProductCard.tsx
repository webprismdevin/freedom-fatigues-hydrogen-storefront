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
import {Fragment, ReactNode, useState} from 'react';
import useRedo from '~/hooks/useRedo';
import useTags from '~/hooks/useTags';
import {Dialog, Listbox, Popover, Transition} from '@headlessui/react';

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

  // const [hovered, setHovered] = useState(false);
  // const [shown, cycleShown] = useCycle(false, true);
  // const [showOptions, cycleOptions] = useCycle(false, true);
  // const [selectedVariant, setSelectedVariant] = useState<
  //   ProductVariant | (() => void)
  // >(() => {
  //   return product.variants.nodes.find((variant) => variant.availableForSale);
  // });

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
          <div className="grid grid-cols-3 gap-4 h-12">
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
        <div className="h-10">
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
      {quickAdd && (
        <QuickAddModal className="mt-2 border-2 border-contrast/20 rounded py-2 w-full">
          Add to Bag
        </QuickAddModal>
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
    <div className="flex gap-4">
      <div className="aspect-square bg-primary/5 min-w-[128px] max-w-[128px]">
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
        <Text className="flex flex-col md:flex-row md:gap-2 text-sm">
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
      <div className="grid grid-cols-2 gap-2">
        <RebuyPriceRange priceRange={product.priceRange} />
      </div>
    </div>
  );
}

const RebuyPriceRange = ({priceRange}: {priceRange: RebuyPriceRange}) => {
  return (
    <span className="text-xs">
      {`$${priceRange.min}${priceRange.isRange ? '+' : ''}`}
    </span>
  );
};

export function QuickAddModal({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children ?? 'Add'}
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Payment successful
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your payment has been successfully submitted. We’ve sent
                      you an email with all of the details of your order.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
