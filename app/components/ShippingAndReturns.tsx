import {Image} from '@shopify/hydrogen';
import {urlFor} from '~/lib/sanity';

export default function ShippingAndReturns({
  mode,
  data,
}: {
  mode?: 'light' | 'dark';
  data: any;
}) {
  const {contentLeft, image, contentRight} = data;

  const titleClass = 'font-heading text-3xl uppercase md:text-5xl';

  if (mode === 'light') {
    return (
      <div
        className="align-center grid grid-cols-1 gap-4 bg-contrast p-12 text-primary md:grid-cols-3"
        key={data._key}
      >
        <div className="col-span-1 grid place-items-center">
          <div className="text-center">
            <h2 className={titleClass}>{contentLeft.title}</h2>
            <p>{contentLeft.content}</p>
          </div>
        </div>
        <div className="col-span-1 grid place-items-center">
          <Image
            src={urlFor(image)
              .width(image.width)
              .height(image.height)
              .format('webp')
              .url()}
            height={image.height}
            width={image.width}
            loading="lazy"
            className="invert"
            alt={image?.alt}
          />
        </div>
        <div className="col-span-1 grid place-items-center">
          <div className="text-center">
            <h2 className={titleClass}>{contentRight.title}</h2>
            <p>{contentRight.content}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="align-center grid grid-cols-1 gap-4 p-12 md:grid-cols-3 "
      key={data._key}
    >
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h2 className={titleClass}>{contentLeft.title}</h2>
          <p>{contentLeft.content}</p>
        </div>
      </div>
      <div className="col-span-1 grid place-items-center">
        <Image
          src={urlFor(image)
            .width(image.width)
            .height(image.height)
            .format('webp')
            .url()}
          height={image.height}
          width={image.width}
          style={{
            maxHeight: 90,
            width: 'auto',
          }}
          loading="lazy"
          alt={image?.alt}
        />
      </div>
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h2 className={titleClass}>{contentRight.title}</h2>
          <p>{contentRight.content}</p>
        </div>
      </div>
    </div>
  );
}
