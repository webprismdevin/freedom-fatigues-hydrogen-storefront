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
      className="relative px-12 py-8 text-center lg:h-[500px] lg:p-24"
      key={data._key}
    >
      <h2 className="font-heading text-4xl">{data.title}</h2>
      <Link to="/reviews">See all reviews</Link>
      <AnimatePresence mode="wait">
        <motion.div
          className="pt-8"
          initial={{x: -1000 * direction, opacity: 0}}
          animate={{x: 0, opacity: 1}}
          exit={{x: 1000 * direction, opacity: 0}}
          custom={direction}
          key={page}
        >
          <ReviewCard {...reviews[index]} />
        </motion.div>
      </AnimatePresence>
      <NavArrowLeft
        className="absolute left-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="previous"
        onClick={() => paginate(-1)}
      />
      <NavArrowRight
        className="absolute right-5 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
        aria-label="next"
        onClick={() => paginate(1)}
      />
    </div>
  );
}

// const reviews = [
//   {
//     text: 'The look is perfect and the cotton material is so comfortable. It washes without shrinking and I love the look!',
//     name: 'Gail Leslie Q.',
//     rating: 5,
//   },
//   {
//     text: "This is a quality hat, fit, finish and feels as good as it looks. You can really see and feel the quality of this hat. I'm looking forward to wearing it when weather warms up a bit.",
//     name: 'Brian H.',
//     rating: 5,
//   },
//   {
//     text: 'Great quality shirts and wonder customer service! I ordered the wrong size for my husband. Sent an email requesting an exchange and received an immediate response from Ryann with a return shipping label. Will definitely order from Freedom Fatigues again!',
//     name: 'Melody N.',
//     rating: 5,
//   },
// ];
