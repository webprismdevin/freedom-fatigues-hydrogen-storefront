export function CollectionGrid() {
  const imageClass =
    'absolute left-0 top-0 z-0 h-full w-full object-cover object-center opacity-80';

  const collectionClass =
    'relative grid place-items-center font-heading text-2xl uppercase min-h-[200px]';

  return (
    <div className="grid min-h-[400px] grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className={collectionClass}>
        <img
          className={imageClass}
          src={
            'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/mens-arid-camo-american-flag-oversized-hoodie.png?v=1673590867Í'
          }
          alt=""
          loading="lazy"
        />
        <span className="z-1 relative text-6xl">Men</span>
      </div>
      <div className={collectionClass}>
        <img
          className={imageClass}
          src={
            'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/crewneck_gray_96f027fb-1f32-497f-a14f-3d7d90319697.png?v=1665038644'
          }
          alt=""
          loading="lazy"
        />
        <span className="z-1 relative text-6xl">Women</span>
      </div>
      <div className={collectionClass}>
        <img
          className={imageClass}
          src={
            'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/1776_American_Ball_Cap6.jpg?v=1680879375'
          }
          alt=""
          loading="lazy"
        />
        <span className="z-1 relative text-6xl">Hats</span>
      </div>
      <div className={collectionClass}>
        <img
          className={imageClass}
          src={
            'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/usa-flag-bracelet.png?v=1664866872'
          }
          alt=""
          loading="lazy"
        />
        <span className="z-1 relative text-6xl">Accessories</span>
      </div>
    </div>
  );
}
