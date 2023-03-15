import {motion, AnimatePresence} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';

export default function AnnouncementBar({data: announcements}: any) {
  const [[page, direction], setPage] = useState([0, 0]);
  const index = wrap(0, announcements.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 2900);

    return () => clearInterval(interval);
  }, [page]);

  console.log(announcements);

  return (
    <div className="h-12 overflow-hidden">
      <div
        style={{
          position: 'relative',
        }}
      >
        <AnimatePresence>
          <motion.div
            style={{
              position: 'absolute',
            }}
            initial={{opacity: 0, x: -1000}}
            animate={{opacity: 1, x: 0, background: announcements[index].color}}
            exit={{opacity: 0, x: 1000}}
            custom={direction}
            key={page}
            className="flex items-center justify-center w-full h-12 text-white"
          >
            <span>{announcements[index].title}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
