import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {
  json,
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import {statusMessage} from '~/utils';
import type {
  Order,
  OrderLineItem,
  DiscountApplicationConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {Link, Heading, PageHeader, Text} from '~/components';

export const meta: V2_MetaFunction<typeof loader> = ({data}) => {
  return {title: `Order ${data?.order?.name}`};
};

export async function loader({request, context, params}: LoaderArgs) {
  if (!params.id) {
    return redirect(params?.lang ? `${params.lang}/account` : '/account');
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  invariant(orderToken, 'Order token is required');

  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `${params.lang}/account/login` : '/account/login',
    );
  }

  const orderId = `gid://shopify/Order/${params.id}?key=${orderToken}`;

  const data = await context.storefront.query<{node: Order}>(
    CUSTOMER_ORDER_QUERY,
    {variables: {orderId}},
  );

  const order = data?.node;

  if (!order) {
    throw new Response('Order not found', {status: 404});
  }

  const lineItems = flattenConnection(order.lineItems!) as Array<OrderLineItem>;

  const discountApplications = flattenConnection(
    order.discountApplications as DiscountApplicationConnection,
  );

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
  });
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage} =
    useLoaderData<typeof loader>();
  return (
    <div>
      <PageHeader heading="Order detail">
        <Link to="/account">
          <Text color="subtle">Return to Account Overview</Text>
        </Link>
      </PageHeader>
      <div className="w-full p-6 sm:grid-cols-1 md:p-8 lg:p-12 lg:py-6">
        <div>
          <Text as="h3" size="lead">
            Order No. {order.name}
          </Text>
          <Text className="mt-2" as="p">
            Placed on {new Date(order.processedAt!).toDateString()}
          </Text>
          <div className="grid items-start gap-12 sm:grid-cols-1 sm:divide-y sm:divide-gray-200 md:grid-cols-4 md:gap-16">
            <table className="my-8 min-w-full divide-y divide-gray-300 md:col-span-3">
              <thead>
                <tr className="align-baseline ">
                  <th
                    scope="col"
                    className="pb-4 pl-0 pr-3 text-left font-semibold"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 text-right font-semibold sm:table-cell md:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 text-right font-semibold sm:table-cell md:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-4 text-right font-semibold"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* @ts-ignore */}
                {lineItems.map((lineItem: OrderLineItem) => (
                  <tr key={lineItem.variant!.id}>
                    <td className="w-full max-w-0 py-4 pl-0 pr-3 align-top sm:w-auto sm:max-w-none sm:align-middle">
                      <div className="flex gap-6">
                        <Link
                          to={`/products/${lineItem.variant!.product!.handle}`}
                        >
                          {lineItem?.variant?.image && (
                            <div className="card-image aspect-square w-24">
                              <Image
                                data={lineItem.variant.image}
                                width={96}
                                height={96}
                              />
                            </div>
                          )}
                        </Link>
                        <div className="hidden flex-col justify-center lg:flex">
                          <Text as="p">{lineItem.title}</Text>
                          <Text size="fine" className="mt-1" as="p">
                            {lineItem.variant!.title}
                          </Text>
                        </div>
                        <dl className="grid">
                          <dt className="sr-only">Product</dt>
                          <dd className="truncate lg:hidden">
                            <Heading size="copy" format as="h3">
                              {lineItem.title}
                            </Heading>
                            <Text size="fine" className="mt-1">
                              {lineItem.variant!.title}
                            </Text>
                          </dd>
                          <dt className="sr-only">Price</dt>
                          <dd className="truncate sm:hidden">
                            <Text size="fine" className="mt-4">
                              <Money data={lineItem.variant!.price!} />
                            </Text>
                          </dd>
                          <dt className="sr-only">Quantity</dt>
                          <dd className="truncate sm:hidden">
                            <Text className="mt-1" size="fine">
                              Qty: {lineItem.quantity}
                            </Text>
                          </dd>
                        </dl>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:table-cell sm:align-middle">
                      <Money data={lineItem.variant!.price!} />
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:table-cell sm:align-middle">
                      {lineItem.quantity}
                    </td>
                    <td className="px-3 py-4 text-right align-top sm:table-cell sm:align-middle">
                      <Text>
                        <Money data={lineItem.discountedTotalPrice!} />
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pl-6 pr-3 pt-6 text-right font-normal sm:table-cell md:pl-0"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <th
                      scope="row"
                      className="pr-3 pt-6 text-left font-normal sm:hidden"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <td className="pl-3 pr-4 pt-6 text-right font-medium text-green-700 md:pr-3">
                      {discountPercentage ? (
                        <span className="text-sm">
                          -{discountPercentage}% OFF
                        </span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-6 pr-3 pt-6 text-right font-normal sm:table-cell md:pl-0"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <th
                    scope="row"
                    className="pr-3 pt-6 text-left font-normal sm:hidden"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <td className="pl-3 pr-4 pt-6 text-right md:pr-3">
                    <Money data={order.subtotalPriceV2!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-6 pr-3 pt-4 text-right font-normal sm:table-cell md:pl-0"
                  >
                    Tax
                  </th>
                  <th
                    scope="row"
                    className="pr-3 pt-4 text-left font-normal sm:hidden"
                  >
                    <Text>Tax</Text>
                  </th>
                  <td className="pl-3 pr-4 pt-4 text-right md:pr-3">
                    <Money data={order.totalTaxV2!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-6 pr-3 pt-4 text-right font-semibold sm:table-cell md:pl-0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    className="pr-3 pt-4 text-left font-semibold sm:hidden"
                  >
                    <Text>Total</Text>
                  </th>
                  <td className="pl-3 pr-4 pt-4 text-right font-semibold md:pr-3">
                    <Money data={order.totalPriceV2!} />
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="sticky top-nav border-none md:my-8">
              <Heading size="copy" className="font-semibold" as="h3">
                Shipping Address
              </Heading>
              {order?.shippingAddress ? (
                <ul className="mt-6">
                  <li>
                    <Text>
                      {order.shippingAddress.firstName &&
                        order.shippingAddress.firstName + ' '}
                      {order.shippingAddress.lastName}
                    </Text>
                  </li>
                  {order?.shippingAddress?.formatted ? (
                    order.shippingAddress.formatted.map((line: string) => (
                      <li key={line}>
                        <Text>{line}</Text>
                      </li>
                    ))
                  ) : (
                    <></>
                  )}
                </ul>
              ) : (
                <p className="mt-3">No shipping address defined</p>
              )}
              <Heading size="copy" className="mt-8 font-semibold" as="h3">
                Status
              </Heading>
              <div
                className={clsx(
                  `mt-3 inline-block w-auto rounded-full px-3 py-1 text-xs font-medium`,
                  order.fulfillmentStatus === 'FULFILLED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-primary/20 text-primary/50',
                )}
              >
                <Text size="fine">
                  {statusMessage(order.fulfillmentStatus!)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CUSTOMER_ORDER_QUERY = `#graphql
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      ... on MoneyV2 {
        amount
        currencyCode
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment Image on Image {
    altText
    height
    src: url(transform: {crop: CENTER, maxHeight: 96, maxWidth: 96, scale: 2})
    id
    width
  }
  fragment ProductVariant on ProductVariant {
    id
    image {
      ...Image
    }
    price {
      ...Money
    }
    product {
      handle
    }
    sku
    title
  }
  fragment LineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...Money
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...Money
    }
    discountedTotalPrice {
      ...Money
    }
    variant {
      ...ProductVariant
    }
  }

  query CustomerOrder(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        fulfillmentStatus
        totalTax {
          ...Money
        }
        totalPrice {
          ...Money
        }
        subtotalPrice {
          ...Money
        }
        shippingAddress {
          ...AddressFull
        }
        discountApplications(first: 100) {
          nodes {
            ...DiscountApplication
          }
        }
        lineItems(first: 100) {
          nodes {
            ...LineItemFull
          }
        }
      }
    }
  }
`;
