import {Fragment, ReactNode, useEffect, useState} from 'react';
import {Dialog, Listbox, Popover, Transition} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import useRedo from '~/hooks/useRedo';
import StarRating from './StarRating';
import {IconClose, IconSelect} from './Icon';

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
  }>(null);

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
        {
          merchandiseId: 'gid://shopify/ProductVariant/40053085339766',
          quantity: 1,
        },
      ];

  //started at 9:45 am
  //   return simple ATC if only one variant
  if (product.variants.nodes?.length === 1 || product.variants.length === 1) {
    const isFromShopify = product.variants.nodes !== undefined;

    const availableForSale = isFromShopify
      ? product.variants.nodes[0].availableForSale
      : true;

    return (
      <AddToCartButton
        disabled={!availableForSale}
        variant="primary"
        className={className + ' cursor-pointer'}
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
                <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-6 md:p-8 text-left align-middle shadow-xl transition-all">
                  <div className="absolute top-4 right-4 z-50 text-lg cursor-pointer">
                    <IconClose onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="mt-2 grid md:grid-cols-2 gap-4">
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
                      <h3 className="text-lg font-medium leading-6 text-gray-900 font-heading">
                        {product.title}
                      </h3>
                      <p className="text-xs text-primary/50 mt-1 mb-2">
                        {product?.caption?.value ?? product.caption}
                      </p>
                      <Listbox
                        onChange={setSelectedVariant}
                        value={selectedVariant}
                      >
                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-1 pr-4 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex items-center justify-between">
                          <span className="flex items-center">
                            {selectedVariant ? (
                              <span>Selected: {selectedVariant.title}</span>
                            ) : (
                              <span className="ml-3 block truncate">
                                Select an option
                              </span>
                            )}
                          </span>
                          <IconSelect />
                        </Listbox.Button>
                        <Listbox.Options className="absolute top-[-82%] md:top-auto mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
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