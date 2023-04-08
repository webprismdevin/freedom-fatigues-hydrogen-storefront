import {AnimatePresence, motion} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {Link} from './Link';
import {useState} from 'react';
import {NavArrowLeft, NavArrowRight} from './Slideshow';
import {IconStar} from './StarRating';

export type Review = {
  text: string;
  name: string;
  rating: number;
};

export const ReviewCard = ({text, name, rating}: Review) => {
  return (
    <div className="mx-auto max-w-[770px]">
      <div className="mb-2 flex flex-row justify-center gap-1">
        {Array(rating)
          .fill(0)
          .map((_, i) => (
            <IconStar key={i} size={24} />
          ))}
      </div>
      <p className="text-2xl font-bold">{text}</p>
      <p className="text-lg font-bold">{name}</p>
    </div>
  );
};

export default function ReviewsCarousel() {
  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, reviews.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="relative h-[500px] p-24 text-center">
      <h2 className="font-heading text-4xl">1100+ 5-Star Reviews</h2>
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

const reviews = [
  {
    text: 'The look is perfect and the cotton material is so comfortable. It washes without shrinking and I love the look!',
    name: 'Gail Leslie Q.',
    rating: 5,
  },
  {
    text: "This is a quality hat, fit, finish and feels as good as it looks. You can really see and feel the quality of this hat. I'm looking forward to wearing it when weather warms up a bit.",
    name: 'Brian H.',
    rating: 5,
  },
  {
    text: 'Great quality shirts and wonder customer service! I ordered the wrong size for my husband. Sent an email requesting an exchange and received an immediate response from Ryann with a return shipping label. Will definitely order from Freedom Fatigues again!',
    name: 'Melody N.',
    rating: 5,
  },
];
