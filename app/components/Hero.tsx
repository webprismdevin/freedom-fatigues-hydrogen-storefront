import {Button} from './Button';
import {useRef} from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from 'framer-motion';

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

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
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target: ref});
  const y = useParallax(scrollYProgress, 200);

  return (
    <div
      className={`flex-column align-center relative flex h-[700px] overflow-hidden p-8 lg:p-24 ${
        layout === 'right' && 'justify-end'
      } ${layout === 'center' && 'justify-center text-center'}`}
      ref={ref}
    >
      <motion.div className="absolute bottom-0 left-0 z-0 h-full w-full">
        <motion.img
          src={image.url}
          className="top-300 absolute left-0 right-0 min-h-full min-w-full object-cover"
          alt={image.alt}
          loading={image.loading ? image.loading : 'lazy'}
        />
      </motion.div>
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
