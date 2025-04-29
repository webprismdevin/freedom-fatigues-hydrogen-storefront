import {useEffect, useCallback, useState, Suspense, useRef} from 'react';
import {useFetcher} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {Listbox} from '@headlessui/react';
import {AddToCartButton} from './AddToCartButton';
import {Drawer} from './Drawer';
import {IconClose, IconSelect, IconCheck} from './Icon';
import StarRating from './StarRating';
import {Link} from './Link';
import useFbCookies from '~/hooks/useFbCookies';
import {fromGID} from '~/lib/gidUtils';
import clsx from 'clsx';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {CartForm} from '@shopify/hydrogen';

type QuickAddProps = {
  children?: React.ReactNode;
  className?: string;
  product: any;
  image?: any;
  rebuy?: boolean;
};

export default function QuickAdd({
  children,
  className,
  product,
  image,
  rebuy,
}: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<{product: any}>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<null | {
    title: string;
    id: string;
    price: string;
    availableForSale: boolean;
    image?: any;
  }>(null);
  const [fbp, fbc] = useFbCookies();
  const initialLoadDone = useRef(false);
  const optionChangeInProgress = useRef(false);
  
  // Monitor cart fetchers to detect when cart drawer opens
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  const openDrawer = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Initial product data load when drawer opens
  useEffect(() => {
    if (isOpen && fetcher.state === 'idle' && !fetcher.data) {
      // Reset state when drawer opens
      setSelectedOptions({});
      setSelectedVariant(null);
      initialLoadDone.current = false;
      optionChangeInProgress.current = false;
      
      // Load product data when drawer opens
      fetcher.load(`/resource/product/${product.handle}`);
    }
  }, [isOpen, product.handle, fetcher]);

  // Handle initial product data load
  useEffect(() => {
    if (fetcher.data?.product && !initialLoadDone.current && !optionChangeInProgress.current) {
      // Initialize selected options with first available variant
      const firstVariant = 
        fetcher.data.product.variants.nodes.find((variant: any) => variant.availableForSale) ||
        fetcher.data.product.variants.nodes[0];

      if (firstVariant) {
        const initialOptions: Record<string, string> = {};
        firstVariant.selectedOptions.forEach((option: any) => {
          initialOptions[option.name] = option.value;
        });
        setSelectedOptions(initialOptions);
        
        // Set the selected variant
        setSelectedVariant({
          title: firstVariant.title,
          id: firstVariant.id,
          price: firstVariant.price?.amount || firstVariant.priceV2?.amount,
          availableForSale: firstVariant.availableForSale,
          image: firstVariant.image
        });
        
        initialLoadDone.current = true;
      }
    }
  }, [fetcher.data]);

  // Update selected variant when options change or when receiving new data after option change
  useEffect(() => {
    if (fetcher.data?.product && initialLoadDone.current) {
      // If we have a selectedVariant from the API response, use it
      if (fetcher.data.product.selectedVariant) {
        setSelectedVariant({
          title: fetcher.data.product.selectedVariant.title,
          id: fetcher.data.product.selectedVariant.id,
          price: fetcher.data.product.selectedVariant.price.amount,
          availableForSale: fetcher.data.product.selectedVariant.availableForSale,
          image: fetcher.data.product.selectedVariant.image
        });
        optionChangeInProgress.current = false;
        return;
      }
      
      // Otherwise, find the variant manually
      const matchedVariant = fetcher.data.product.variants.nodes.find(
        (variant: any) => {
          return variant.selectedOptions.every(
            (option: any) => selectedOptions[option.name] === option.value,
          );
        },
      );

      if (matchedVariant) {
        setSelectedVariant({
          title: matchedVariant.title,
          id: matchedVariant.id,
          price: matchedVariant.price?.amount || matchedVariant.priceV2?.amount,
          availableForSale: matchedVariant.availableForSale,
          image: matchedVariant.image
        });
        optionChangeInProgress.current = false;
      }
    }
  }, [selectedOptions, fetcher.data]);

  const handleOptionChange = useCallback(
    (optionName: string, value: string) => {
      optionChangeInProgress.current = true;
      
      setSelectedOptions((prev) => {
        const newOptions = {...prev, [optionName]: value};

        const queryString = Object.entries(newOptions)
          .map(
            ([key, val]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(val)}`,
          )
          .join('&');

        // Fetch updated product data with new options
        fetcher.load(`/resource/product/${product.handle}?${queryString}`);

        return newOptions;
      });
    },
    [fetcher, product.handle],
  );

  function fireAnalytics() {
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
        }
      );
  }

  // Handle simple product with only one variant
  if (product.variants?.nodes?.length === 1 || product.variants?.length === 1) {
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
          <button className={`${className} bg-primary/10`}>Notify me</button>
        </Link>
      );
  }

  return (
    <>
      <button 
        onClick={openDrawer}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openDrawer();
        }}
        className={className}
      >
        {children ?? 'Add'}
      </button>
      
      <Drawer 
        open={isOpen} 
        onClose={(e?: any) => {
          // Only close if it's an explicit close action
          if (e?.type === 'click' && e.target.closest('[data-test="close-cart"]')) {
            closeDrawer();
          }
        }} 
        openFrom="bottom" 
        className="md:max-w-lg"
      >
        <div role="dialog" aria-modal="true" className="flex flex-col h-full">
          <div className="flex-grow overflow-auto p-4 pb-20">
            <Suspense fallback={<LoadingFallback />}>
              {fetcher.data?.product ? (
                <>
                  <div className="mb-4">
                    <Image
                      data={selectedVariant?.image || fetcher.data.product.featuredImage}
                      alt={
                        selectedVariant?.image?.altText ||
                        `Image for ${product.title}`
                      }
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <StarRating
                        rating={fetcher.data.product.avg_rating?.value ?? fetcher.data.product.avg_rating}
                        count={
                          fetcher.data.product.num_reviews?.value ?? fetcher.data.product.num_reviews
                        }
                      />
                      <h2 className="font-heading text-2xl font-medium leading-6 text-gray-900">
                        {fetcher.data.product.title}
                      </h2>
                      <p className="mb-2 mt-1 text-xs text-primary/50">
                        {fetcher.data.product?.caption?.value ?? fetcher.data.product.caption}
                      </p>
                    </div>
                  </div>
                  
                  {/* Only show variant selector if we have options other than default */}
                  {!(fetcher.data.product.variants.nodes.length === 1 && 
                     fetcher.data.product.variants.nodes[0].selectedOptions.length === 1 && 
                     fetcher.data.product.variants.nodes[0].selectedOptions[0].name === 'Title' && 
                     fetcher.data.product.variants.nodes[0].selectedOptions[0].value === 'Default Title') && (
                    <div className="mb-6">
                      {fetcher.data.product.options.map((option: any) => (
                        <div key={option.name} className="mb-4">
                          <p className="font-bold mb-2 uppercase">{option.name}</p>
                          <div className="relative w-full">
                            <Listbox
                              value={selectedOptions[option.name] || ''}
                              onChange={(value) => handleOptionChange(option.name, value)}
                            >
                              {({open}) => (
                                <>
                                  <Listbox.Button
                                    className="relative flex w-full cursor-default items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-3 pr-4 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                  >
                                    <span className="flex items-center">
                                      {selectedOptions[option.name] || 'Select an option'}
                                    </span>
                                    <IconSelect />
                                  </Listbox.Button>
                                  <Listbox.Options
                                    className={clsx(
                                      'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-3 pl-5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
                                      open ? 'block' : 'hidden'
                                    )}
                                  >
                                    {option.values.map((value: any) => {
                                      // Check if this option value is available
                                      const isAvailable = fetcher.data?.product.variants.nodes.some(
                                        (variant: any) => {
                                          const hasThisOption = variant.selectedOptions.some(
                                            (opt: any) => opt.name === option.name && opt.value === value
                                          );
                                          return hasThisOption && variant.availableForSale;
                                        }
                                      );
                                      
                                      return (
                                        <Listbox.Option
                                          key={`option-${option.name}-${value}`}
                                          value={value}
                                          disabled={!isAvailable}
                                          className={({active, selected, disabled}) => 
                                            clsx(
                                              'relative cursor-default select-none py-2 pl-10 pr-4',
                                              active && 'bg-primary/10',
                                              selected && 'font-semibold',
                                              disabled && 'opacity-50 cursor-not-allowed'
                                            )
                                          }
                                        >
                                          {({selected}) => (
                                            <div className="flex items-center">
                                              <span>{value}</span>
                                              {selected && (
                                                <span className="ml-2">
                                                  <IconCheck />
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </Listbox.Option>
                                      );
                                    })}
                                  </Listbox.Options>
                                </>
                              )}
                            </Listbox>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mb-20">
                    <h3 className="font-bold mb-2 uppercase">Description</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: fetcher.data.product.descriptionHtml,
                      }}
                    />
                  </div>
                </>
              ) : (
                <LoadingFallback />
              )}
            </Suspense>
          </div>
          
          {/* Fixed Add to Cart button at bottom */}
          {fetcher.data?.product && (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
              <AddToCartButton
                disabled={!selectedVariant?.availableForSale}
                variant="primary"
                className={!selectedVariant ? 'opacity-50 w-full' : 'w-full'}
                onClick={() => fireAnalytics()}
                lines={[
                  {
                    merchandiseId: selectedVariant?.id || '',
                    quantity: 1,
                  },
                ]}
              >
                {selectedVariant?.availableForSale ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>Add to Bag</span> | ${selectedVariant?.price}
                  </span>
                ) : (
                  'Sold Out'
                )}
              </AddToCartButton>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}

const LoadingFallback = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};
