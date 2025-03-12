import React from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';
import StarRating from './StarRating';

// Define the type for a Shopify Recommendation
export type ShopifyRecommendation = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    url: string;
    altText?: string;
  } | null;
  rating?: number;
  reviewCount?: number;
};

type Layout = 'vertical' | 'horizontal';

export const ShopifyRecommendationCard = ({
  product,
  layout = 'vertical',
  className,
}: {
  product: ShopifyRecommendation;
  layout?: Layout;
  className?: string;
}) => {
  return (
    <div className={clsx(
      "rounded border p-2",
      layout === 'horizontal' ? "flex gap-4" : "min-w-32",
      className
    )}>
      <Link 
        to={`/products/${product.handle}`}
        className={clsx(
          layout === 'horizontal' && "flex gap-4 flex-1"
        )}
      >
        <div className={clsx(
          layout === 'horizontal' ? "flex-shrink-0" : ""
        )}>
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className={clsx(
                "object-cover aspect-square",
                layout === 'horizontal' ? "h-24 w-24" : "h-32 w-32"
              )}
            />
          ) : (
            <div className={clsx(
              "bg-gray-200",
              layout === 'horizontal' ? "h-24 w-24" : "h-28 w-full"
            )} />
          )}
        </div>
        <div className={clsx(
          layout === 'horizontal' ? "flex-1" : "mt-2"
        )}>
          <div className="my-1">
            <StarRating rating={product.rating || 0} count={product.reviewCount} />
          </div>
          <h3 className="line-clamp-2 font-medium">{product.title}</h3>
          <p className="text-primary/50 text-sm">
            {product.priceRange?.minVariantPrice
              ? `${product.priceRange.minVariantPrice.currencyCode} ${product.priceRange.minVariantPrice.amount}`
              : ''}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ShopifyRecommendationCard;
