import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section} from '~/components';
import {useIsHomePath} from '~/lib/utils';

export function ProductSwimlane({
  title = 'Featured Products',
  products = [],
  count = 12,
  ...props
}: {
  title?: string;
  products?: SerializeFrom<Product[]>;
  count?: number;
}) {
  const isHome = useIsHomePath();

  if (!products?.length) {
    return null;
  }

  return (
    <Section
      heading={title}
      padding="y"
      className={`${
        isHome ? 'bg-primary text-contrast' : 'bg-contrast text-primary'
      }`}
      {...props}
    >
      <div className="swimlane hiddenScroll md:scroll-px-8 md:px-8 md:pb-8 lg:scroll-px-12 lg:px-12">
        {products.map((product) => {
          if (product.id === 'gid://shopify/Product/6859749195894') return null;
          return (
            <ProductCard
              product={product}
              key={product.id}
              className="w-80 snap-start"
              quickAdd={true}
            />
          );
        })}
      </div>
    </Section>
  );
}
