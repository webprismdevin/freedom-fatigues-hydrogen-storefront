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
      <motion.div
        style={{y}}
        className="absolute left-0 top-0 z-0 h-full w-full"
      >
        <Image
          src={urlFor(image.asset).format('webp').quality(80).url()}
          sizes={'100vw'}
          className="mx-auto mt-0 min-h-full w-auto object-cover"
          alt={image.alt}
          loading={image.loading ? image.loading : 'lazy'}
        />
      </motion.div>
      <div
        className={`${
          layout === 'right' && 'text-right'
        } z-1 relative self-center text-contrast`}
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
