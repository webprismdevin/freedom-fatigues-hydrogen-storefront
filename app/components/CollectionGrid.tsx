import {urlFor} from '~/lib/sanity';
import {Link} from './Link';

export function CollectionGrid({data}: {data: any}) {
  const {collections} = data;

  const imageClass =
    'absolute left-0 top-0 z-0 h-full w-full object-cover object-center opacity-80';

  const collectionClass =
    'relative grid place-items-center font-heading text-2xl uppercase min-h-[200px]';

  return (
    <div
      className="grid min-h-[400px] grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4"
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
          <span className="z-1 relative text-6xl">{collection.title}</span>
        </Link>
      ))}
    </div>
  );
}
