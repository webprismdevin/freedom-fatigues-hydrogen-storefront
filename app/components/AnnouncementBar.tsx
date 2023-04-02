import {motion, AnimatePresence} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';

export default function AnnouncementBar({
  data: announcements,
  internal: slideInterval,
}: any) {
  const [[page, direction], setPage] = useState([0, 0]);
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
    <div className="h-12 overflow-hidden">
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
        }}
        custom={direction}
        key={page}
        initial={{backgroundColor: 'transparent'}}
        animate={{backgroundColor: announcements[index].color}}
        exit={{backgroundColor: 'transparent'}}
        transition={{backgroundColor: {duration: 0.2}}}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{opacity: 0, x: -1000}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 1000}}
            custom={direction}
            key={page}
            className="absolute flex h-12 w-full items-center justify-center text-white"
          >
            <span>{announcements[index].title}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
