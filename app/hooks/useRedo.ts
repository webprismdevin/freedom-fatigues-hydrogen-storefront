import {useMatches} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {cartAdd} from '~/routes/cart';

export default function useRedo() {
  const [root] = useMatches();
  const [isInCart, setInCart] = useState(false);

  const findRedo = async () => {
    const cart = await root.data?.cart;

    return cart.lines.edges.some(
      (line: any) => line.node.merchandise.sku === 'x-redo',
    );
  };

  useEffect(() => {
    async function run() {
      setInCart(await findRedo());
    }

    run();
  }, [root.data?.cart]);

  return [isInCart];
}
