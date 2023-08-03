import clsx from 'clsx';
import React, {useRef} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import {
  Button,
  Heading,
  IconRemove,
  Text,
  Link,
  FeaturedProducts,
} from '~/components';
import {getInputStyleClasses} from '~/utils';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher} from '@remix-run/react';
import {CartAction} from '~/lib/type';
import GovXID from './GovXID';
import {cartRemove} from '~/routes/cart';
import {fromGID} from '~/lib/gidUtils';
import {useState, useEffect} from 'react';
import confetti from 'canvas-confetti';
import { Rebuy_MiniProductCard } from './ProductCard';

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartType | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  // @todo: get optimistic cart cost
  const isZeroCost = !cart || cart?.cost?.subtotalAmount?.amount === '0.0';

  const container = {
    drawer: 'h-screen-no-nav flex flex-col',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };

  return (
    <div className={container[layout]}>
      {cart && layout == 'drawer' && <FreeShippingBar cart={cart} />}
      <CartLines lines={cart?.lines} layout={layout} />
      <div>
        {cart && layout == 'page' && <FreeShippingCartPage cart={cart} />}
        {!isZeroCost && (
          <CartSummary cost={cart.cost} layout={layout}>
            <CartDiscounts discountCodes={cart.discountCodes} />
            <CartCheckoutActions cart={cart} checkoutUrl={cart.checkoutUrl} />
            <GovXID center />
          </CartSummary>
        )}
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
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto flex-grow transition md:px-12',
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

function CartCheckoutActions({
  cart,
  checkoutUrl,
}: {
  cart: CartType;
  checkoutUrl: string;
}) {
  if (!checkoutUrl) return null;

  const handleCheckout = () => {
    if (window.dataLayer) {
      window.dataLayer.push({ecommerce: null});
      window.dataLayer.push({
        event: 'begin_checkout',
        currency: 'USD',
        value: cart.cost.totalAmount.amount,
        coupon: cart.discountCodes?.map(({code}) => code).join(', ') || null,
        ecommerce: {
          items: cart.lines.edges.map(({node}) => ({
            item_name: node.merchandise.product.title,
            item_id: fromGID(node.merchandise.product.id),
            item_variant: node.merchandise.title,
            brand: 'Freedom Fatigues',
            price: node.merchandise.price.amount,
          })),
        },
        eventCallback: () => {
          window.location.href = checkoutUrl;
        },
        eventTimeout: 2000,
      });
    } else {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="mt-2 flex flex-col">
      <a
        href={checkoutUrl}
        target="_self"
        className="w-full cursor-pointer bg-black px-4 py-3 text-center text-white transition-colors duration-200 hover:bg-FF-red hover:opacity-80"
      >
        {/* <Button
        className="cursor-pointer hover:opacity-80"
        onClick={handleCheckout}
        as="span"
        width="full"
      > */}
        Continue to Checkout
        {/* </Button> */}
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
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
    drawer: 'grid gap-3 px-6 pt-6 pb-3 border-t md:px-12 align-end',
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
              <CartLineQuantityAdjust line={line} />
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
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.REMOVE_FROM_CART}
      />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} />
      <button
        className="flex h-10 w-10 items-center justify-center rounded border"
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconRemove aria-hidden="true" />
      </button>
    </fetcher.Form>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
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
            className="h-10 w-10 text-primary/50 transition hover:text-primary disabled:text-primary/10"
            value={prevQuantity}
            disabled={quantity <= 1}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="h-10 w-10 text-primary/50 transition hover:text-primary"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
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
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="cartAction" value={CartAction.UPDATE_CART} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      {children}
    </fetcher.Form>
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
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
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
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Text>
        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section>
      <div className="mt-2">
        <GovXID />
      </div>
      <section className="grid gap-8 pt-16">
        {/* <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        /> */}
        <RebuyRecommendations />
      </section>
    </div>
  );
}

const RebuyRecommendations = React.memo(() => {
  const {load, data} = useFetcher();

  useEffect(() => {
    load('/rebuy/recommended');
  }, [load])

  useEffect( () => {
    console.log(data)
  }, [data])

  if (!data) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((product: any) => (
        <Rebuy_MiniProductCard product={product} key={product.admin_graph_ql_api_id} />
      ))}
    </div>
  )
});
//Free Shipping Progress Bar

function ProgressBar({value}: {value: number}) {
  const [width, setWidth] = useState(0);
  const [confettiFired, setConfettiFired] = useState(() => {
    if (window.sessionStorage.getItem('confettiFired') === 'true') {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (value >= 1) {
      setWidth(100);
      if (!confettiFired) {
        confetti({
          colors: ['#B31942', '#0A3161', '#FFFFFF'],
          particleCount: 100,
          spread: 70,
          origin: {y: 0.6, x: 0.8},
        });
        setConfettiFired(true);
        window.sessionStorage.setItem('confettiFired', 'true');
      }
      return;
    }
    setWidth(value * 100);
  }, [value]);

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

function FreeShippingBar({cart}: {cart: CartType}) {
  const isFreeShipping = Number(cart?.cost.subtotalAmount.amount) < 70;

  return (
    <div className="bg-black px-6 py-2 text-white md:px-12">
      <ProgressBar value={Number(cart.cost.subtotalAmount.amount) / 70} />
      <div className="mt-2 text-center text-xs font-bold">
        {isFreeShipping
          ? `Add $${Math.floor(
              70 - Number(cart.cost.subtotalAmount.amount),
            )} for free U.S.
            shipping`
          : "You've unlocked free U.S. shipping!"}
      </div>
    </div>
  );
}

function FreeShippingCartPage({cart}: {cart: CartType}) {
  return (
    <div className="rounded bg-primary/5 px-6 pb-4 pt-6 md:px-12">
      <ProgressBar value={Number(cart.cost.subtotalAmount.amount) / 70} />
      <div className="mt-2 text-center text-xs font-bold">
        {Number(cart.cost.subtotalAmount.amount) < 70
          ? `Add $${Math.floor(
              70 - Number(cart.cost.subtotalAmount.amount),
            )} for free U.S.
            shipping`
          : "You've unlocked free U.S. shipping!"}
      </div>
    </div>
  );
}
