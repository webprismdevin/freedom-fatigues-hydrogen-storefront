import clsx from 'clsx';
import React, {useMemo, useRef, useEffect, useState, useCallback} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import {
  Button,
  Heading,
  IconRemove,
  Text,
  Link,
  AddToCartButton,
} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useMatches} from '@remix-run/react';
import {CartAction} from '~/lib/type';
import GovXID from './GovXID';
import confetti from 'canvas-confetti';
import posthog from 'posthog-js';
import {CartForm, useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {RedoCheckoutButtons} from '@redotech/redo-hydrogen';
import {RedoProvider} from '@redotech/redo-hydrogen';
import ShopifyRecommendations from './ShopifyRecommendations';
import ShopifyRecommendationCard from './ShopifyRecommendationCard';

type Layouts = 'page' | 'drawer';

const freeShippingThreshold = 99;
const REDO_STORE_ID = '6439e48e41e6bb001f6407a5';

type OptimisticCartLine = CartLine & {
  isOptimistic?: boolean;
};

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartType | null;
}) {
  if (!cart) return null;

  // Use optimistic cart
  const optimisticCart = useOptimisticCart(cart);

  const lines = optimisticCart?.lines?.nodes || [];
  const linesCount = lines.length > 0;

  // Memoize the cart transformation for Redo
  const cartForRedo = useMemo(
    () =>
      ({
        ...optimisticCart,
        lines: {
          nodes: lines,
          edges: lines.map((node) => ({node})),
          pageInfo: {hasNextPage: false, hasPreviousPage: false},
        },
      } as unknown as CartType),
    [optimisticCart, lines],
  );

  // Ensure cart has all required properties
  if (!optimisticCart?.cost?.totalAmount) {
    console.log('Missing required cart properties');
    return (
      <CartEmpty hidden={false} onClose={onClose} layout={layout} cart={cart} />
    );
  }

  // If cart is empty, show empty state
  if (!linesCount) {
    return <CartEmpty hidden={false} onClose={onClose} layout={layout} cart={cart} />;
  }

  return (
    <RedoProvider
      cart={cartForRedo}
      storeId={REDO_STORE_ID}
    >
      <CartDetails cart={cart} layout={layout} />
    </RedoProvider>
  );
}

function ProgressBar({value}: {value: number}) {
  const isHydrated = useIsHydrated();
  const [width, setWidth] = useState(0);
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    // Check sessionStorage only after hydration
    if (isHydrated) {
      const hasConfettiFired =
        window.sessionStorage.getItem('confettiFired') === 'true';
      setConfettiFired(hasConfettiFired);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (value >= 1) {
      setWidth(100);
      if (!confettiFired && isHydrated) {
        const hasConfettiFired =
          window.sessionStorage.getItem('confettiFired') === 'true';
        if (!hasConfettiFired) {
          confetti({
            colors: ['#B31942', '#0A3161', '#FFFFFF'],
            particleCount: 100,
            spread: 70,
            origin: {y: 0.6, x: 0.8},
          });
          window.sessionStorage.setItem('confettiFired', 'true');
          setConfettiFired(true);
        }
      }
      return;
    }
    setWidth(value * 100);
  }, [value, confettiFired, isHydrated]);

  return (
    <div className="relative h-2 w-full bg-slate-200">
      <div
        className={`absolute left-0 top-0 h-full ${
          width < 100 ? 'bg-blue-600' : 'bg-green-500'
        } transition-all duration-500`}
        style={{width: `${width}%`}}
      />
    </div>
  );
}

function checkCartOffer(offerSettings: any) {
  const {offer_period} = offerSettings;
  const currentDate = new Date();
  const offerStartDate = new Date(offer_period.start);
  const offerEndDate = new Date(offer_period.end);
  const isOfferValid =
    currentDate.getTime() >= offerStartDate.getTime() &&
    currentDate.getTime() <= offerEndDate.getTime();
  return isOfferValid;
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  const [root] = useMatches();
  const [offerUnlocked, setOfferUnlocked] = useState(false);
  const [offerValid, setOfferValid] = useState(false);

  const settings = (root.data as any).settings;

  useEffect(() => {
    if (cart) {
      const isValid = checkCartOffer(settings.cart_offer);

      if (isValid) {
        setOfferValid(true);
      }

      const isItemInCart = cart?.lines?.edges?.some((line) => {
        return (
          line?.node?.merchandise?.product?.id ===
          settings.cart_offer.product.store.gid
        );
      });

      if (
        isValid &&
        !isItemInCart &&
        cart.cost.totalAmount.amount >= settings.cart_offer.threshold
      ) {
        setOfferUnlocked(true);
      } else {
        setOfferUnlocked(false);
      }
    }
  }, [cart, cart?.cost.totalAmount.amount, cart?.lines?.edges?.length]);

  // @todo: get optimistic cart cost
  const isZeroCost = !cart || cart?.cost?.subtotalAmount?.amount === '0.0';

  const container = {
    drawer: 'flex h-cart-content flex-col',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12 h-full',
  };

  return (
    <div className={container[layout]}>
      {!isZeroCost && (
        <>
          {cart && layout == 'drawer' && <FreeShippingProgress cart={cart} />}
          {/* flex container for all content between header & cart summary */}
          {offerValid &&
            cart.cost.totalAmount.amount <= settings?.cart_offer.threshold && (
              <div className="bg-primary px-6 py-3 text-contrast md:px-12">
                <p className="text-center font-heading">
                  {settings.cart_offer.copy}
                </p>
              </div>
            )}
          <div className="flex-1 overflow-auto">
            {offerUnlocked ? (
              <div className="px-6 pb-6 md:px-12">
                <div className="flex gap-3">
                  <div>
                    <img
                      className="aspect-square overflow-hidden rounded border"
                      src={settings.cart_offer.product.store.previewImageUrl}
                      alt={settings.cart_offer.product.store.title}
                      height={96}
                      width={96}
                    />
                  </div>
                  <div className="flex min-h-full flex-1 flex-col justify-between">
                    <p className="line-clamp-2 font-bold">
                      {/* prettier-ignore */}
                      You unlocked a free{' '}
                      {settings.cart_offer.product.store.title}
                    </p>
                    <p>
                      <span className="line-through">$39.95</span>&nbsp;
                      <span className="font-bold text-red-500">FREE</span>
                    </p>
                    <AddToCartButton
                      lines={[
                        {
                          merchandiseId:
                            settings.cart_offer.product.store.variants[0].store
                              .gid,
                          quantity: 1,
                        },
                      ]}
                      className="w-full"
                    >
                      Add to cart
                    </AddToCartButton>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h5
                  className={clsx(
                    'font-heading text-lg',
                    layout === 'drawer' ? 'px-6' : 'px-0',
                  )}
                >
                  You might also like
                </h5>
                <div
                  className={clsx(
                    'hiddenScroll relative flex min-h-48 snap-x flex-row gap-4 overflow-x-auto py-4',
                    layout === 'drawer' ? 'px-6' : 'px-0',
                  )}
                >
                  {cart?.lines?.nodes && cart.lines.nodes.length > 0 && (
                    <ShopifyRecommendations
                      containerClassName="w-1/3 shrink-0 grow-0 md:w-1/4"
                      productId={
                        cart.lines.nodes[cart.lines.nodes.length - 1].merchandise.product.id
                      }
                    >
                      {({recommendations, isLoading}) => (
                        <>
                          {isLoading ? (
                            <>
                              {Array.from({length: 4}).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1/3 shrink-0 grow-0 animate-pulse md:w-1/4"
                                >
                                  <div className="h-40 w-full rounded bg-gray-200" />
                                </div>
                              ))}
                            </>
                          ) : (
                            <>
                              {recommendations.map((product) => (
                                <ShopifyRecommendationCard
                                  key={product.id}
                                  product={product}
                                  layout="vertical"
                                  className="w-1/3 shrink-0 grow-0 md:w-1/4"
                                />
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </ShopifyRecommendations>
                  )}
                </div>
              </div>
            )}
            <hr />
            <CartLines lines={cart?.lines} layout={layout} />
          </div>
          {/* should stay at the bottom of the cart */}
          <CartSummary cost={cart.cost} layout={layout}>
            {cart && layout == 'page' && <FreeShippingProgress cart={cart} />}
            <CartDiscounts discountCodes={cart.discountCodes} />
            <CartCheckoutActions cart={cart} checkoutUrl={cart.checkoutUrl} />
            <GovXID center />
          </CartSummary>
        </>
      )}
    </div>
  );
}

function CartCheckoutActions({
  cart,
  checkoutUrl,
}: {
  cart: CartType;
  checkoutUrl: string;
}) {
  if (!checkoutUrl) return null;

  // Add defensive check for cart data
  if (!cart.cost?.totalAmount) return null;

  const lines = flattenConnection(cart.lines);
  if (lines.length === 0) return null;

  const handleAnalytics = useCallback(
    (enabled: boolean) => {
      // Capture checkout event
      posthog.capture('begin_checkout', {
        $value: cart.cost.totalAmount.amount,
        currency: cart.cost.totalAmount.currencyCode,
        items: lines.map((line) => ({
          product_id: line.merchandise.product.id,
          variant_id: line.merchandise.id,
          product_title: line.merchandise.product.title,
          variant_title: line.merchandise.title,
          price: parseFloat(line.cost.totalAmount.amount),
          quantity: line.quantity,
        })),
        redo_coverage: enabled,
      });
    },
    [cart.cost.totalAmount, lines],
  );

  // Memoize the cart transformation for Redo
  const cartForRedo = useMemo(
    () =>
      ({
        ...cart,
        lines: {
          nodes: lines,
          edges: lines.map((node) => ({node})),
          pageInfo: {hasNextPage: false, hasPreviousPage: false},
        },
      } as unknown as CartType),
    [cart, lines],
  );

  // Memoize the fallback button
  const fallbackButton = useMemo(
    () => (
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{
          lines: [{
            merchandiseId: 'your-redo-product-id',
            quantity: 1,
            attributes: [{
              key: 'redo_opted_in_from_cart',
              value: 'true'
            }]
          }]
        }}
      >
        <input type="hidden" name="checkoutUrl" value={checkoutUrl} />
        <button
          type="submit"
          onClick={() => handleAnalytics(false)}
          className="w-full cursor-pointer bg-black px-4 py-3 text-center text-white transition-colors duration-200 hover:bg-FF-red hover:opacity-80"
        >
          Continue to Checkout
        </button>
      </CartForm>
    ),
    [checkoutUrl, handleAnalytics],
  );

  return (
    <div className="mt-2 flex w-full flex-col text-center">
      <RedoCheckoutButtons
        onClick={handleAnalytics}
        cart={cartForRedo}
        storeId={REDO_STORE_ID}
      >
        {fallbackButton}
      </RedoCheckoutButtons>
    </div>
  );
}

function FreeShippingProgress({cart}: {cart: CartType}) {
  //qualified shipping cart cost
  const cart_cost = useMemo(() => {
    const lines = flattenConnection(cart.lines) as CartLine[];
    return lines.reduce((total: number, line: CartLine) => {
      return total + Number(line.cost.totalAmount.amount);
    }, 0);
  }, [cart.lines]);

  const isFreeShipping = cart_cost < freeShippingThreshold;

  return (
    <div className="px-6 py-2 md:px-12">
      <ProgressBar value={cart_cost / freeShippingThreshold} />
      <div className="mt-2 text-center text-xs font-bold">
        {isFreeShipping
          ? `Add $${Math.floor(
              freeShippingThreshold - cart_cost,
            )} for FREE U.S. shipping`
          : "You've unlocked free U.S. shipping!"}
      </div>
      <div className="text-center text-xs">
        (Free shipping only applicable to FF gear)
      </div>
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes = discountCodes?.map(({code}) => code).join(', ') || null;

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes}</Text>
          </div>
        </div>
      </dl>
      {/* No discounts, show an input to apply a discount */}
      <UpdateDiscountForm>
        <div
          className={clsx(
            codes ? 'hidden' : 'flex',
            'items-stretch justify-between gap-4 text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex items-center justify-end whitespace-nowrap rounded bg-slate-200 px-3 py-1 font-medium text-black">
            <span>Apply Discount</span>
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({children}: {children: React.ReactNode}) {
  const fetcher = useFetcher();

  useEffect(() => {
    console.log(fetcher.data);
  }, [fetcher]);

  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.UPDATE_DISCOUNT}
      />
      {children}
    </fetcher.Form>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : // overflow-auto
        'px-6 pb-6 sm-max:pt-2 flex-grow transition md:px-12',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="mt-6 grid flex-1 gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line as CartLine} />
        ))}
      </ul>
    </section>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  const summary = {
    drawer: 'grid gap-3 px-6 pt-6 pb-0 border-t md:px-12 align-end',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
  };

  return (
    <>
      <section aria-labelledby="summary-heading" className={summary[layout]}>
        <h2 id="summary-heading" className="sr-only">
          Order summary
        </h2>
        <dl className="grid">
          <div className="flex items-center justify-between font-medium">
            <Text as="dt">Subtotal</Text>
            <Text as="dd" data-test="subtotal">
              {cost?.subtotalAmount?.amount ? (
                <Money data={cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </Text>
          </div>
        </dl>
        {children}
      </section>
    </>
  );
}

function CartLineItem({line}: {line: CartLine}) {
  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  if (merchandise.product.vendor === 're:do') return null;

  return (
    <li key={id} className="flex gap-4">
      <div className="shrink-0">
        {merchandise.image && (
          <Image
            width={220}
            height={220}
            data={merchandise.image}
            className="h-24 w-24 rounded border object-cover object-center md:h-28 md:w-28"
            alt={merchandise.title}
          />
        )}
      </div>

      <div className="flex flex-grow justify-between">
        <div className="grid gap-2">
          <Heading as="h3" size="copy">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Text>{merchandise?.product?.title || ''}</Text>
            )}
          </Heading>

          <div className="grid pb-2">
            {(merchandise?.selectedOptions || []).map((option) => {
              if (option.value !== 'Default Title')
                return (
                  <Text color="subtle" key={option.name}>
                    {option.name}: {option.value}
                  </Text>
                );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex justify-start text-copy">
              <CartLineQuantityAdjust line={line as OptimisticCartLine} />
            </div>
            <ItemRemoveButton lineIds={[id]} />
          </div>
        </div>
        <Text>
          <CartLinePrice line={line} as="span" />
        </Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineIds}: {lineIds: CartLine['id'][]}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        className="flex h-10 w-10 items-center justify-center rounded border"
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconRemove aria-hidden="true" />
      </button>
    </CartForm>
  );
}

function CartLineQuantityAdjust({line}: {line: OptimisticCartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center rounded border">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className={clsx(
              'h-10 w-10 transition hover:text-primary disabled:text-primary/10',
              isOptimistic ? 'opacity-50' : 'text-primary/50',
            )}
            value={prevQuantity}
            disabled={quantity <= 1 || isOptimistic}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className={clsx(
              'h-10 w-10 transition hover:text-primary',
              isOptimistic ? 'opacity-50' : 'text-primary/50',
            )}
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={isOptimistic}
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
      route="/cart" // adjust if needed
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
  cart,
}: {
  hidden: boolean;
  layout?: 'page' | 'drawer';
  onClose?: () => void;
  cart?: CartType;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Text format>
          Looks like you haven't added anything yet, let's get you started!
        </Text>
        <div>
          <Button onClick={onClose} width="full">
            Continue shopping
          </Button>
        </div>
      </section>
      <div className="mt-2">
        <GovXID />
      </div>
    </div>
  );
}
