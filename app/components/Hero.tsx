import {urlFor} from '~/lib/sanity';
import {Button} from './Button';
import {SanityImageAssetDocument} from '@sanity/client';
import {Image} from '@shopify/hydrogen';
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
};

export function Hero({data}: {data: Hero}) {
  const {image, title, caption, cta, layout, size} = data;

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
      <div
        style={{background: 'black', opacity: image.overlay / 100 ??  0}}
        className="absolute bottom-0 left-0 right-0 top-0 z-10"
      />
      <motion.div
        style={{y}}
        className="absolute left-0 top-0 z-0 h-full w-full"
      >
        <Image
          src={urlFor(image).format('webp').quality(100).url()}
          sizes={'100vw'}
          className="mx-auto mt-0 min-h-full w-auto object-cover"
          alt={image.alt}
          loading={image.loading ? image.loading : 'lazy'}
        />
      </motion.div>
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
