import React, { useEffect, ReactNode } from "react";
import { useFetcher } from "@remix-run/react";
import ShopifyRecommendationCard, { type ShopifyRecommendation } from "./ShopifyRecommendationCard";
import clsx from 'clsx';

type Layout = 'vertical' | 'horizontal';

type RenderProps = {
  recommendations: ShopifyRecommendation[];
  isLoading: boolean;
};

export default function ShopifyRecommendations({
  productId,
  className,
  containerClassName,
  limit,
  layout = 'vertical',
  children,
}: {
  productId: string;
  className?: string;
  containerClassName?: string;
  limit?: number;
  layout?: Layout;
  children: (props: RenderProps) => ReactNode;
}) {
  const fetcher = useFetcher<{ recommendations: ShopifyRecommendation[] }>();

  useEffect(() => {
    if (productId) {
      const url = `/product-recommendations?productId=${productId}${limit ? `&limit=${limit}` : ''}`;
      fetcher.load(url);
    }
  }, [productId, limit]);

  // Log response for debugging
  useEffect(() => {
    console.log("Product Recommendations Response:", fetcher.data);
  }, [fetcher.data]);

  if (!fetcher.data) {
    return (
      <div className={clsx("grid gap-4", containerClassName)}>
        {Array.from({ length: limit || 6 }).map((_, i) => (
          <div key={i} className={`${className} animate-pulse`}>
            <div className="h-40 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return children({
    recommendations: fetcher.data.recommendations,
    isLoading: !fetcher.data,
  });
} 