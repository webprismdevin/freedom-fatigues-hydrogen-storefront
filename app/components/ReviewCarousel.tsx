import {AnimatePresence, motion} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {Link} from './Link';
import {useEffect, useState} from 'react';
import {NavArrowLeft, NavArrowRight} from './Slideshow';
import {IconStar} from './StarRating';

export type Review = {
  review: string;
  name: string;
  rating: number;
};

export const ReviewCard = ({review, name, rating}: Review) => {
  return (
    <div className="mx-auto max-w-[770px]">
      <div className="mb-2 flex flex-row justify-center gap-1">
        {Array(rating)
          .fill(0)
          .map((_, i) => (
            <IconStar key={i} size={24} />
          ))}
      </div>
      <p className="text-xl font-bold md:text-2xl">{review}</p>
      <p className="text-md mt-2 font-bold lg:text-lg">{name}</p>
    </div>
  );
};

export default function ReviewCarousel({data}: {data: any}) {
  const {reviews} = data;

  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, reviews.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [page]);

  return (
    <div
      className="flex h-[600px] flex-col pb-8 pt-12 lg:h-[500px] "
      key={data._key}
    >
      <div className="px-6 text-center lg:px-24">
        <h2 className="font-heading text-4xl">{data.title}</h2>
        <Link to="/reviews">See all reviews</Link>
      </div>
      <AnimatePresence mode="wait">
        <div className="relative flex flex-1 items-center justify-center">
          <NavArrowLeft
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer lg:left-5"
            aria-label="previous"
            onClick={() => paginate(-1)}
          />
          <motion.div
            className="px-12 text-center lg:px-24"
            initial={{x: -1000 * direction, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: 1000 * direction, opacity: 0}}
            custom={direction}
            transition={{
              ease: 'linear',
              duration: 0.2,
            }}
            key={page}
          >
            <ReviewCard {...reviews[index]} />
          </motion.div>
          <NavArrowRight
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer lg:right-5"
            aria-label="next"
            onClick={() => paginate(1)}
          />
        </div>
      </AnimatePresence>
    </div>
  );
}