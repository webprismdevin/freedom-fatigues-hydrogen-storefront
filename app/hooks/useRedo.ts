import {useMatches} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import {useEffect, useState, useMemo, useCallback} from 'react';

export default function useRedo() {
  const [root] = useMatches();
  const [isInCart, setInCart] = useState(false);
  const [addRedo, setAddRedo] = useState(true);
  const [redoResponse, setRedoResponse] = useState<any>(null);

  const findRedo = useCallback(async () => {
    const cart = await root.data?.cart;

    const line =
      cart?.lines?.edges.find(
        (line: any) => line.node.merchandise.sku === 'x-redo',
      ) ?? null;

    return line;
  }, [root.data?.cart]);

  const getRedo = useCallback(async () => {
    const response = await fetch('/get-redo');
    const data = await response.json() as {products?: {edges: any[]}};

    if (data?.products?.edges?.length === 0) {
      return null;
    }

    const products = flattenConnection(data.products);
    const variants = flattenConnection(products[0].variants);

    const mutated_response = {
      title: products[0].title,
      id: variants[0].id,
      price: variants[0].price.amount,
    };

    return mutated_response;
  }, []);

  useEffect(() => {
    if (isInCart) setAddRedo(false);
  }, [isInCart]);

  useEffect(() => {
    async function run() {
      const cartHasRedo = await findRedo();
      setInCart(!!cartHasRedo);
      const data = await getRedo();
      setRedoResponse(data);
    }

    run();
  }, [findRedo, getRedo]);

  const memoizedResult = useMemo(() => [isInCart, redoResponse, addRedo, setAddRedo], [
    isInCart,
    redoResponse,
    addRedo,
  ]);

  return memoizedResult;
}
