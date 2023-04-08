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

export function HeroParallax({image}: {image: {url: string; alt: string}}) {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target: ref});
  const y = useParallax(scrollYProgress, 200);

  return (
    <div
      className="flex-column align-center relative flex h-[700px] overflow-hidden p-24"
      ref={ref}
    >
      <motion.div className="absolute bottom-0 left-0 z-0 h-full w-full">
        <motion.img
          src={image.url}
          className="top-300 absolute left-0 right-0 min-w-full"
          alt={image.alt}
          loading="lazy"
          //   style={{y}}
        />
      </motion.div>
      <div className="z-1 relative self-center">
        <p className="text-2xl font-bold">
          Hand-Stitched Hats Built In America
        </p>
        <h2 className="mb-4 font-heading text-6xl uppercase">
          American Craftsmanship
        </h2>
        <Button>Shop Hats</Button>
      </div>
    </div>
  );
}
