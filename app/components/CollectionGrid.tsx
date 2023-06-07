import {urlFor} from '~/lib/sanity';
import {Link} from './Link';
import {Image} from '@shopify/hydrogen';

export function CollectionGrid({data}: {data: any}) {
  const {collections} = data;

  const imageClass =
    'absolute left-0 top-0 z-0 h-full w-full object-cover object-center';

  const collectionClass =
    'relative grid place-items-center font-heading text-2xl uppercase min-h-[100px] md:min-h-[200px]';

  function isEven(n: number) {
    return n % 2 == 0;
  }

  return (
    <div
      className={`grid min-h-[300px] ${
        isEven(collections.length) ? 'grid-cols-2' : 'grid-cols-1'
      } gap-4 p-4 md:min-h-[400px] md:grid-cols-${collections.length}`}
      key={data._key}
    >
      {collections.map((collection: any) => (
        <Link
          to={collection.to}
          className={collectionClass}
          key={collection._key}
        >
          <Image
            className={imageClass}
            src={urlFor(collection.image).height(800).format('webp').url()}
            alt={collection.image.alt ? collection.image.alt : collection.title}
            loading={data.loading ?? 'lazy'}
            sizes={'33vw'}
          />
          <span className="z-1 text-shadow relative text-center text-2xl text-white md:text-3xl lg:text-5xl">
            {collection.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
