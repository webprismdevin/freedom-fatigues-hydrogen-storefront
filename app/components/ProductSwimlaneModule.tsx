import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section} from '~/components';
import {useIsHomePath} from '~/lib/utils';
import {useEffect, useState} from 'react';

interface CollectionResponse {
  collection: {
    collectionByHandle: {
      products: {
        nodes: Product[];
      };
    };
  };
}

export function ProductSwimlaneModule({data, ...props}: {data: any}) {
  const isHome = useIsHomePath();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch(`/get-collection/${data.handle}`);
      const {collection} = (await response.json()) as CollectionResponse;
      console.log(collection);
      setProducts(collection.collectionByHandle.products.nodes);
    }

    fetchProducts();
  }, []);

  return (
    <Section
      heading={data.title}
      padding="y"
      className={`${
        isHome ? 'bg-primary text-contrast' : 'bg-contrast text-primary'
      }`}
      {...props}
    >
      <div className="swimlane hiddenScroll md:scroll-px-8 md:px-8 md:pb-8 lg:scroll-px-12 lg:px-12">
        {products.map((product) => {
          //hack out Re:do
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
