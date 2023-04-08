import {AnimatePresence, motion} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';
import {Button} from './Button';

export interface Slide {
  id: string;
  image1: string;
  image2?: string;
  title: string;
  description: string;
  button: {
    text: string;
    link: string;
  };
}

export default function SlideShow({slides}: {slides: Slide[]}) {
  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, slides.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     paginate(1);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [page]);

  return (
    <motion.div
      className="relative h-screen max-h-[700px] w-screen"
      custom={direction}
      key={page}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{x: -1000 * direction, opacity: 0}}
          animate={{x: 0, opacity: 1}}
          exit={{x: 1000 * direction, opacity: 0}}
          custom={direction}
          key={page}
          className={`relative grid h-full w-full bg-white ${
            slides[index].image2 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          <div className="absolute z-10 grid h-full w-full place-items-center">
            <div className="text-center">
              <h2 className="font-heading text-6xl uppercase">
                {slides[index].title}
              </h2>
              <p className="mb-4 max-w-lg">{slides[index].description}</p>
              <Button>{slides[index].button.text}</Button>
            </div>
          </div>
          <div
            className={`h-full overflow-hidden ${
              slides[index].image2 ? 'max-w-1/2' : 'min-w-full'
            }`}
          >
            <img
              src={slides[index].image1}
              className={`min-h-full object-cover ${
                slides[index].image2 ? '' : 'min-w-full'
              }`}
              alt={slides[index].description}
            />
          </div>
          {slides[index].image2 && (
            <div className="max-w-1/2 h-full overflow-hidden">
              <img
                src={slides[index].image2}
                className="min-h-full object-cover"
                alt={slides[index].description}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* back arrow */}
      <NavArrowLeft
        className="absolute left-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="previous"
        onClick={() => paginate(-1)}
      />
      {/* next arrow */}
      <NavArrowRight
        className="absolute right-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="next"
        onClick={() => paginate(1)}
      />
    </motion.div>
  );
}

export const slidesData = [
  {
    id: '1',
    image1:
      'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Copy_of_Homepage_Header.png?v=1679025048',
    image2:
      'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Copy_of_Copy_of_Copy_of_Copy_of_Copy_of_Copy_of_New_Keychain_5751c8bd-27bb-4876-adf2-6c7b72efd672.png?v=1675453521',
    title: 'Slide 1',
    description:
      'Pariatur aliqua nostrud pariatur consectetur laborum dolore anim laboris adipisicing et pariatur veniam magna magna.',
    button: {
      text: 'Shop Now',
      link: '/',
    },
  },
  {
    id: '2',
    image1:
      'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Homepage_Header_78120f68-52e2-4634-bc3f-a68f52fd814e.png?v=1678676481',
    image2: undefined,
    title: 'Slide 2',
    description: 'Duis velit do magna proident qui irure ad exercitation.',
    button: {
      text: 'Shop Now',
      link: '/',
    },
  },
];

export const NavArrowLeft = ({
  color,
  size,
  ...props
}: {
  color?: string;
  size?: number;
  props: any;
}) => {
  return (
    <svg
      {...props}
      width={size ? size : 24}
      height={size ? size : 24}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color !== undefined ? color : '#ffffff'}
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke={color !== undefined ? color : '#ffffff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export const NavArrowRight = ({
  color,
  size,
  ...props
}: {
  color?: string;
  size?: number;
  props: any;
}) => {
  return (
    <svg
      {...props}
      width={size ? size : 24}
      height={size ? size : 24}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color !== undefined ? color : '#ffffff'}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke={color !== undefined ? color : '#ffffff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
