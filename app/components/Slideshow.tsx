import {AnimatePresence, motion} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';
import {Button} from './Button';
import {urlFor} from '~/lib/sanity';

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
}

export default function SlideShow({data}: {data: any}) {
  const {slides}: {slides: Slide[]} = data;

  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, slides.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // return <div>Send data</div>;

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
          className={`relative grid h-full w-full grid-cols-1 bg-white ${
            slides[index].image2 ? 'lg:grid-cols-2' : ''
          }`}
        >
          <div className="absolute z-10 grid h-full w-full place-items-center px-12">
            <div className="text-center">
              <p className="mb-4">{slides[index].caption}</p>
              <h2 className="mb-6 max-w-xl text-center font-heading text-6xl uppercase">
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
            <img
              src={urlFor(slides[index].image)
                .width(slides[index].image.height)
                .height(slides[index].image.width)
                .format('webp')
                .quality(80)
                .url()}
              height={slides[index].image.height}
              width={slides[index].image.width}
              className={`min-h-full min-w-full object-cover ${
                slides[index].image2 ? '' : 'lg:min-w-full'
              }`}
              alt={slides[index].image?.alt}
            />
          </div>
          {slides[index].image2 && (
            <div className="max-w-1/2 hidden h-full overflow-hidden lg:block">
              <img
                src={urlFor(slides[index].image2)
                  .width(slides[index].image2.height)
                  .height(slides[index].image2.width)
                  .format('webp')
                  .quality(80)
                  .url()}
                height={slides[index].image2.height}
                width={slides[index].image2.width}
                className="min-h-full object-cover"
                alt={slides[index].image2?.alt}
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

// export const slidesData = [
//   {
//     id: '1',
//     image1:
//       'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Copy_of_Homepage_Header.png?v=1679025048',
//     image2:
//       'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Copy_of_Copy_of_Copy_of_Copy_of_Copy_of_Copy_of_New_Keychain_5751c8bd-27bb-4876-adf2-6c7b72efd672.png?v=1675453521',
//     title: 'Slide 1',
//     description:
//       'Pariatur aliqua nostrud pariatur consectetur laborum dolore anim laboris adipisicing et pariatur veniam magna magna.',
//     button: {
//       text: 'Shop Now',
//       link: '/all',
//     },
//   },
//   {
//     id: '2',
//     image1:
//       'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/Homepage_Header_78120f68-52e2-4634-bc3f-a68f52fd814e.png?v=1678676481',
//     image2: undefined,
//     title: 'Slide 2',
//     description: 'Duis velit do magna proident qui irure ad exercitation.',
//     button: {
//       text: 'Shop Now',
//       link: '/',
//     },
//   },
// ];

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
