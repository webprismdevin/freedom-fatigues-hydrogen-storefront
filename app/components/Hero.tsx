import {urlFor} from '~/lib/sanity';
import {Button} from './Button';
import {SanityImageAssetDocument} from '@sanity/client';
import {useScroll, useTransform, motion} from 'framer-motion';
import {useRef} from 'react';

export type Hero = {
  _key: string;
  image: {
    asset: SanityImageAssetDocument;
    alt: string;
    loading?: 'lazy' | 'eager';
    width: number;
    height: number;
    hotspot: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    overlay: number;
  };
  title: string;
  caption: string;
  cta?: {
    text: string;
    to: string;
  };
  layout?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large';
  mobileImage?: {
    asset: SanityImageAssetDocument;
    alt: string;
    loading?: 'lazy' | 'eager';
    width: number;
    height: number;
    hotspot: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    overlay: number;
  };
};

export function Hero({data}: {data: Hero}) {
  const {image, title, caption, cta, layout, size, mobileImage} = data;

  const ref = useRef(null);

  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div
      key={data._key}
      className={`flex-column align-center relative flex ${
        size === 'small' ? 'h-[500px]' : 'h-[800px]'
      } overflow-hidden p-8 lg:p-24 ${layout === 'right' && 'justify-end'} ${
        layout === 'center' && 'justify-center text-center'
      }`}
      ref={ref}
    >
      <picture
        className="absolute bottom-0 left-0 right-0 top-0 z-0"
        style={{width: '100%', height: '100%'}}
      >
        <source
          srcSet={
            mobileImage
              ? urlFor(mobileImage).quality(100).format('webp').url()
              : urlFor(image).quality(100).format('webp').url()
          }
          media="(max-width: 549px)"
        />
        <source
          srcSet={urlFor(image).quality(100).format('webp').url()}
          media="(min-width: 550px)"
        />
        <img
          className="h-full w-full object-cover"
          style={{objectPosition: 'top center'}}
          src={urlFor(image).quality(100).format('webp').url()}
          alt={image.alt}
          loading={image.loading ? image.loading : 'lazy'}
        />
      </picture>
      <div
        style={{
          background: 'black',
          opacity: image?.overlay ? image.overlay / 100 : 0,
        }}
        className="absolute bottom-0 left-0 right-0 top-0 z-10"
      />
      <div
        className={`${
          layout === 'right' && 'text-right'
        } relative z-20 self-center text-contrast`}
      >
        <p className="text-shadow text-xl font-bold lg:text-2xl">{caption}</p>
        <h2 className="text-shadow mb-4 font-heading text-4xl uppercase lg:text-6xl">
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
