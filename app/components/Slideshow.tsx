import {AnimatePresence, motion, PanInfo} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useState} from 'react';
import {Button} from './Button';
import {urlFor} from '~/lib/sanity';
import {Image as ShopifyImage} from '@shopify/hydrogen';

export interface Slide {
  id: string;
  image: any;
  image2?: any;
  title: string;
  caption: string;
  cta: {
    text: string;
    to: string;
  };
  colorTheme: 'light' | 'dark';
}

// Animation variants for the slides
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// Swipe threshold for drag gestures
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function SlideShow({data}: {data: any}) {
  const {slides}: {slides: Slide[]} = data;

  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, slides.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="relative h-screen max-h-[700px] w-screen overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className={`absolute h-full w-full grid grid-cols-1 ${
            slides[index].image2 ? 'lg:grid-cols-2' : ''
          } ${slides[index].colorTheme === 'dark' ? 'text-white' : 'text-black'}`}
        >
          <div className="absolute z-10 grid h-full w-full place-items-center px-12">
            <div className="text-center">
              <p className="text-shadow mb-4">{slides[index].caption}</p>
              <h2 className="text-shadow mb-6 max-w-xl text-center font-heading text-4xl uppercase md:text-5xl lg:text-6xl">
                {slides[index].title}
              </h2>
              <Button variant="secondary" to={slides[index].cta.to}>
                {slides[index].cta.text}
              </Button>
            </div>
          </div>
          <div
            className={`h-full min-w-full max-w-full overflow-hidden ${
              slides[index].image2 ? 'lg:max-w-1/2' : ''
            }`}
          >
            <ShopifyImage
              src={urlFor(slides[index].image)
                .width(1200)
                .height(1200)
                .format('webp')
                .quality(80)
                .url()}
              sizes={slides[index].image2 ? '50vw' : '100vw'}
              className={`min-h-full min-w-full object-cover ${
                slides[index].image2 ? '' : 'lg:min-w-full'
              }`}
              alt={slides[index].image?.alt || ''}
            />
          </div>
          {slides[index].image2 && (
            <div className="max-w-1/2 hidden h-full overflow-hidden lg:block">
              <ShopifyImage
                src={urlFor(slides[index].image2)
                  .width(1200)
                  .height(1200)
                  .format('webp')
                  .quality(80)
                  .url()}
                sizes={'50vw'}
                height={slides[index].image2.height}
                width={slides[index].image2.width}
                className="min-h-full object-cover"
                alt={slides[index].image2?.alt || ''}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* back arrow */}
      <button
        className="absolute left-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="previous"
        onClick={() => paginate(-1)}
      >
        <NavArrowLeft />
      </button>
      {/* next arrow */}
      <button
        className="absolute right-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="next"
        onClick={() => paginate(1)}
      >
        <NavArrowRight />
      </button>
    </div>
  );
}

export const NavArrowLeft = ({
  color = '#ffffff',
  size = 24,
  ...props
}: {
  color?: string;
  size?: number;
  [key: string]: any;
}) => {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export const NavArrowRight = ({
  color = '#ffffff',
  size = 24,
  ...props
}: {
  color?: string;
  size?: number;
  [key: string]: any;
}) => {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
