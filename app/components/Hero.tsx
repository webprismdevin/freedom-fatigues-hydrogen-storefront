import {Image} from 'remix-image';
import {Button} from './Button';

export type Hero = {
  image: {
    url: string;
    alt: string;
    loading?: 'lazy' | 'eager';
  };
  title: string;
  caption: string;
  cta: {
    text: string;
    to: string;
  };
  layout?: 'left' | 'right' | 'center';
};

export function Hero({image, title, caption, cta, layout}: Hero) {
  return (
    <div
      className={`flex-column align-center relative flex h-[700px] overflow-hidden p-8 lg:p-24 ${
        layout === 'right' && 'justify-end'
      } ${layout === 'center' && 'justify-center text-center'}`}
    >
      <div className="absolute bottom-0 left-0 z-0 h-full w-full">
        <Image
          loaderUrl="/api/image"
      <div className="absolute bottom-0 left-0 z-0 h-full w-full">
        <img
          src={image.url}
          className="top-300 absolute left-0 right-0 min-h-full min-w-full object-cover"
          alt={image.alt}
          responsive={[
            {
              size: {
                width: 1700,
                height: 700,
              },
              maxWidth: 1800,
            },
          ]}
          loading={image.loading ? image.loading : 'lazy'}
          dprVariants={[1, 3]}
        />
      </div>
      <div
        className={`${
          layout === 'right' && 'text-right'
        } z-1 relative self-center`}
      >
        <p className="text-xl font-bold lg:text-2xl">{caption}</p>
        <h2 className="mb-4 font-heading text-4xl uppercase lg:text-6xl">
          {title}
        </h2>
        <Button to={cta.to} variant="secondary">
          {cta.text}
        </Button>
      </div>
    </div>
  );
}
