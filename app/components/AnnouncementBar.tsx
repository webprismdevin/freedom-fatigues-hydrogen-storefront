import {motion, AnimatePresence} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';
import {useIsHomePath} from '~/utils';

export default function AnnouncementBar({data}: any) {
  const [[page, direction], setPage] = useState([0, 0]);
  const isHome = useIsHomePath();

  const {announcements, slideInterval} = data;

  const index = wrap(0, announcements.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const interval = setInterval(
      () => {
        paginate(1);
      },
      slideInterval ? slideInterval : 3000,
    );

    return () => clearInterval(interval);
  }, [page]);

  return (
    <div
      className={`h-12 overflow-hidden ${
        isHome ? 'bg-contrast' : 'bg-primary'
      }`}
    >
      <motion.div className="z-1 relative h-full" custom={direction} key={page}>
        <AnimatePresence>
          {announcements[index].link ? (
            <motion.a
              href={announcements[index].link}
              initial={{x: -1000}}
              animate={{x: 0}}
              exit={{x: 1000}}
              custom={direction}
              key={page}
              className={`absolute flex h-12 w-full items-center justify-center ${
                isHome ? 'text-primary' : 'text-contrast'
              }`}
            >
              <span>{announcements[index].title}</span>
            </motion.a>
          ) : (
            <motion.div
              initial={{x: -1000}}
              animate={{x: 0}}
              exit={{x: 1000}}
              custom={direction}
              key={page}
              className={`absolute flex h-12 w-full items-center justify-center ${
                isHome ? 'text-primary' : 'text-contrast'
              }`}
            >
              <span>{announcements[index].title}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
