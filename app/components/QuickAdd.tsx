import {Fragment, ReactNode, useState} from 'react';
import {Product} from 'schema-dts';
import {Dialog, Listbox, Popover, Transition} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {ProductOptions} from '~/routes/products.$productHandle';
import {AddToCartButton} from './AddToCartButton';

export default function QuickAdd({
  children,
  className,
  product,
  image,
}: {
  children?: ReactNode;
  className?: string;
  product?: any;
  image?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
                <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-2 grid grid-cols-2">
                    <div>
                      {image && (
                        <Image
                          className="fadeIn aspect-[4/5] w-full object-cover"
                          sizes="320px"
                          aspectRatio="1/1"
                          data={image}
                          alt={image?.altText || `Picture of ${product.title}`}
                          loading={'lazy'}
                        />
                      )}
                    </div>
                    <div className="relative">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 font-heading">
                        {product.title}
                      </h3>
                      <p className="text-sm">{product?.caption?.value}</p>
                      <Listbox
                        onChange={setSelectedVariant}
                        value={selectedVariant}
                      >
                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <span className="flex items-center">
                            <span className="ml-3 block truncate">
                              Choose an option
                            </span>
                          </span>
                        </Listbox.Button>
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                          {product.variants.nodes.map((variant: any) => (
                            <Listbox.Option
                              key={variant.id}
                              value={variant.id}
                              disabled={!variant.availableForSale}
                              className={({active}) =>
                                `relative z-50 cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-gray-900'
                                }
                                ${
                                  !variant.availableForSale
                                    ? 'opacity-50'
                                    : 'opacity-100'
                                }
                                `
                              }
                            >
                              {variant.title}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Listbox>
                    </div>
                  </div>
                  <div className="mt-4">
                    <AddToCartButton
                      disabled={!selectedVariant}
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                      lines={[
                        {
                          merchandiseId: selectedVariant ?? '',
                          quantity: 1,
                        },
                      ]}
                    >
                      Add to Bag
                    </AddToCartButton>
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
