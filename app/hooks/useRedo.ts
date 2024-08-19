import {useMatches} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

export default function useRedo() {
  const [root] = useMatches();
  const [isInCart, setInCart] = useState(false);
  const [addRedo, setAddRedo] = useState(true);
  const [redoResponse, setRedoResponse] = useState<any>(null);

  const findRedo = async () => {
    const cart = await root.data?.cart;

    const line =
      cart?.lines?.edges.find(
        (line: any) => line.node.merchandise.sku === 'x-redo',
      ) ?? null;


    return line;
  };

  const getRedo = async () => {
    const response = await fetch('/get-redo');
    const data = await response.json();

    if(data?.products?.edges?.length === 0){
      return null;
    }

    const products = flattenConnection(data.products);
    const variants = flattenConnection(products[0].variants);

    const mutated_response = {
      title: products[0].title,
      id: variants[0].id,
      price: variants[0].price.amount,
    };

    console.log(mutated_response);

    return mutated_response;
  };

  useEffect(() => {
    if (isInCart || !redoResponse) setAddRedo(false);
  }, [isInCart]);

  useEffect(() => {
    async function run() {
      const isInCart = (await findRedo()) ? true : false;

      setInCart(isInCart);
      const data = await getRedo();
      setRedoResponse(data);
    }

    run();
  }, [root.data?.cart]);

  return [isInCart, redoResponse, addRedo, setAddRedo];
}
