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
            <h1 className={titleClass}>{contentLeft.title}</h1>
            <p>{contentLeft.content}</p>
          </div>
        </div>
        <div className="col-span-1 grid place-items-center">
          <Image
            src={urlFor(image).width(200).height(166).format('webp').url()}
            height={166 / 1.8}
            width={200 / 1.8}
            loading="lazy"
            className="invert"
            alt="Freedom Fatigues branded American flag"
          />
        </div>
        <div className="col-span-1 grid place-items-center">
          <div className="text-center">
            <h1 className={titleClass}>{contentRight.title}</h1>
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
          <h1 className={titleClass}>{contentLeft.title}</h1>
          <p>{contentLeft.content}</p>
        </div>
      </div>
      <div className="col-span-1 grid place-items-center">
        <Image
          src={urlFor(image).width(200).height(166).format('webp').url()}
          height={166 / 1.8}
          width={200 / 1.8}
          loading="lazy"
          alt="Freedom Fatigues branded American flag"
        />
      </div>
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h1 className={titleClass}>{contentRight.title}</h1>
          <p>{contentRight.content}</p>
        </div>
      </div>
    </div>
  );
}
