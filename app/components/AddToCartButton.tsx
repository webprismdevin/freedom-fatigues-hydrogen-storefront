import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import {useMatches} from '@remix-run/react';
import {Button} from '~/components';
import {CartForm} from '@shopify/hydrogen';

export function AddToCartButton({
  children,
  lines,
  className = '',
  variant = 'primary',
  width = 'full',
  analytics,
  ...props
}: {
  children: React.ReactNode;
  lines: CartLineInput[];
  className?: string;
  variant?: 'primary' | 'secondary' | 'inline';
  width?: 'auto' | 'full';
  analytics?: unknown;
  [key: string]: any;
}) {
  const [root] = useMatches();
  const selectedLocale = root?.data?.selectedLocale;

  return (
    <CartForm
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: lines.map(line => ({
          ...line,
          selectedVariant: line.selectedVariant || (line.merchandiseId ? { id: line.merchandiseId } : undefined)
        })),
        countryCode: selectedLocale?.country,
        analytics,
      }}
      route="/cart" // Optional: adjust if your cart form should post to a different route
    >
      <Button
        as="button"
        type="submit"
        width={width}
        variant={variant}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </CartForm>
  );
}
