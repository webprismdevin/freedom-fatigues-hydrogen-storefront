import {Fragment, ReactNode, useEffect, useState} from 'react';
import {Dialog, Listbox, Popover, Transition} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import useRedo from '~/hooks/useRedo';
import StarRating from './StarRating';
import {IconClose, IconSelect} from './Icon';
import {Link} from './Link';
// import {RebuyPriceRange} from './ProductCard';
import {fromGID} from '~/lib/gidUtils';
import useFbCookies from '~/hooks/useFbCookies';
import { v4 as uuidv4 } from 'uuid';

export default function QuickAdd({
  children,
  className,
  product,
  image,
  rebuy,
}: {
  children?: ReactNode;
  className?: string;
  product?: any;
  image?: any;
  rebuy?: boolean;
}) {
  const variants = product?.variants?.nodes ?? product.variants;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<null | {
    title: string;
    id: string;
    price: string;
  }>(null);
  const [fbp, fbc] = useFbCookies();

  const [isRedoInCart] = useRedo();

  // toggle modal when adding to cart
  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  useEffect(() => {
    if (addToCartFetchers[0]?.state === 'loading') {
      setIsOpen(false);
    }
  }, [addToCartFetchers]);

  const redoLine = isRedoInCart
    ? []
    : [
        // {
        //   merchandiseId: 'gid://shopify/ProductVariant/40476097871990',
        //   quantity: 1,
        // },
      ];

  function fireAnalytics() {
    const ff_id = window.sessionStorage.getItem('ff_id');

    const event_id = `atc__${ff_id}__${uuidv4()}`;
    const event_source_url = window.location.href;
    const content_ids = [fromGID(selectedVariant?.id!)];
    const content_name = product.title;
    const content_type = 'product';
    const value = selectedVariant?.price;
    const currency = 'USD';

    if (window.fbq)
      window.fbq(
        'track',
        'AddToCart',
        {
          content_ids,
          content_name,
          content_type,
          value,
          currency,
        },
        {
          eventID: event_id,
        },
      );

    fetch(
      `/server/AddToCart?event_id=${event_id}&event_source_url=${event_source_url}&content_ids=${content_ids}&content_name=${content_name}&content_type=${content_type}&value=${
        selectedVariant?.price
      }&currency=${currency}${fbp ? `&fbp=${fbp}` : ''}${
        fbc !== null ? `&fbc=${fbc}` : ''
      }`,
    );
  }

  if (product.variants.nodes?.length === 1 || product.variants.length === 1) {
    const isFromShopify = product.variants.nodes !== undefined;

    const availableForSale = isFromShopify
      ? product.variants.nodes[0].availableForSale
      : true;

    if (availableForSale)
      return (
        <AddToCartButton
          disabled={!availableForSale}
          variant="primary"
          className={className + ' cursor-pointer'}
          onClick={() => fireAnalytics()}
          lines={[
            ...redoLine,
            {
              merchandiseId:
                product.variants[0]?.admin_graphql_api_id ??
                product.variants.nodes[0].id,
              quantity: 1,
            },
          ]}
        >
          {children ?? 'Add'}
        </AddToCartButton>
      );
    else
      return (
        <Link to={`/products/${product.handle}`}>
          <button className={` ${className} bg-primary/10`}>Notify me</button>
        </Link>
      );
  }

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
                <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all md:p-8">
                  <div className="absolute right-4 top-4 z-50 cursor-pointer text-lg">
                    <IconClose onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="mt-2 grid gap-4 md:grid-cols-2">
                    <div>
                      {image && (
                        <Image
                          className="fadeIn aspect-[4/5] w-full object-cover"
                          sizes="320px"
                          aspectRatio="1/1"
                          data={typeof image === 'object' ? image : undefined}
                          src={typeof image === 'string' ? image : undefined}
                          alt={image?.altText || `Picture of ${product.title}`}
                          loading={'lazy'}
                        />
                      )}
                    </div>
                    <div className="relative">
                      <StarRating
                        rating={product.avg_rating?.value ?? product.avg_rating}
                        count={
                          product.num_reviews?.value ?? product.num_reviews
                        }
                      />
                      <h3 className="font-heading text-lg font-medium leading-6 text-gray-900">
                        {product.title}
                      </h3>
                      <p className="mb-2 mt-1 text-xs text-primary/50">
                        {product?.caption?.value ?? product.caption}
                      </p>
                      {/* <p>{selectedVariant?.price}</p> */}
                      <Listbox
                        onChange={setSelectedVariant}
                        value={selectedVariant}
                      >
                        <Listbox.Button className="relative flex w-full cursor-default items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-3 pr-4 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                          <span className="flex items-center">
                            {selectedVariant ? (
                              <span>Selected: {selectedVariant.title}</span>
                            ) : (
                              <span className="block truncate">
                                Select an option
                              </span>
                            )}
                          </span>
                          <IconSelect />
                        </Listbox.Button>
                        <Listbox.Options className="absolute top-[-82%] z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-3 pl-5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm md:top-auto">
                          {variants.map((variant: any) => {
                            const soldOut = rebuy
                              ? false
                              : !variant.availableForSale;

                            return (
                              <Listbox.Option
                                key={variant.admin_graphql_api_id ?? variant.id}
                                value={{
                                  title: variant.title,
                                  id:
                                    variant.admin_graphql_api_id ?? variant.id,
                                  price:
                                    variant.price ?? variant.priceV2.amount,
                                }}
                                disabled={soldOut}
                                className={({active}) =>
                                  `relative z-50 cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'text-gray-900'
                                  }
                                ${soldOut ? 'opacity-50' : 'opacity-100'}
                                `
                                }
                              >
                                {variant.title}
                              </Listbox.Option>
                            );
                          })}
                        </Listbox.Options>
                      </Listbox>
                      <div className="mt-2">
                        <AddToCartButton
                          disabled={!selectedVariant}
                          variant="primary"
                          onClick={() => fireAnalytics()}
                          className={!selectedVariant ? 'opacity-50' : ''}
                          lines={[
                            ...redoLine,
                            {
                              merchandiseId: selectedVariant
                                ? selectedVariant.id
                                : '',
                              quantity: 1,
                            },
                          ]}
                        >
                          {selectedVariant ? 'Add to Bag' : 'Select an option'}
                        </AddToCartButton>
                      </div>
                    </div>
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
