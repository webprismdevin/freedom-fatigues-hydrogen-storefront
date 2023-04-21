import {urlFor} from '~/lib/sanity';
import {Button} from './Button';
import {SanityImageAssetDocument} from '@sanity/client';
import {Image} from '@shopify/hydrogen';

export type Hero = {
  _key: string;
  image: {
    asset: SanityImageAssetDocument;
    alt: string;
    loading?: 'lazy' | 'eager';
    width: number;
    height: number;
  };
  title: string;
  caption: string;
  cta?: {
    text: string;
    to: string;
  };
  layout?: 'left' | 'right' | 'center';
};

export function Hero({data}: {data: Hero}) {
  const {image, title, caption, cta, layout} = data;
  const {height, width} = image;

  return (
    <div
      key={data._key}
      className={`flex-column align-center relative flex h-[700px] overflow-hidden p-8 lg:p-24 ${
        layout === 'right' && 'justify-end'
      } ${layout === 'center' && 'justify-center text-center'}`}
    >
      <div className="absolute bottom-0 left-0 z-0 h-full w-full">
        <Image
          src={urlFor(image.asset).format('webp').quality(80).url()}
          sizes={'100vw'}
          className="top-300 absolute left-0 right-0 min-h-full min-w-full object-cover"
          alt={image.alt}
          loading={image.loading ? image.loading : 'lazy'}
        />
      </div>
      <div
        className={`${
          layout === 'right' && 'text-right'
        } z-1 relative self-center text-contrast`}
      >
        <p className="text-xl font-bold lg:text-2xl">{caption}</p>
        <h2 className="mb-4 font-heading text-4xl uppercase lg:text-6xl">
          {title}
        </h2>
        {cta?.to && (
          <Button to={cta.to} variant="secondary">
            {cta.text}
          </Button>
        )}
      </div>
    </div>
  );
}
