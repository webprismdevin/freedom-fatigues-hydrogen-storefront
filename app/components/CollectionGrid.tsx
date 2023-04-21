import {urlFor} from '~/lib/sanity';
import {Link} from './Link';

export function CollectionGrid({data}: {data: any}) {
  const {collections} = data;

  const imageClass =
    'absolute left-0 top-0 z-0 h-full w-full object-cover object-center';

  const collectionClass =
    'relative grid place-items-center font-heading text-2xl uppercase min-h-[200px]';

  return (
    <div
      className={`grid min-h-[400px] grid-cols-1 gap-4 p-4 md:grid-cols-${collections.length}`}
      key={data._key}
    >
      {collections.map((collection: any) => (
        <Link
          to={collection.to}
          className={collectionClass}
          key={collection._key}
        >
          <img
            className={imageClass}
            src={urlFor(collection.image).url()}
            alt=""
            loading="lazy"
          />
          <span className="z-1 relative text-5xl text-white">
            {collection.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
