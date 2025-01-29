import {motion, AnimatePresence} from 'framer-motion';
import {wrap} from '@popmotion/popcorn';
import {useEffect, useState} from 'react';
import {useIsHomePath} from '~/lib/utils';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function AnnouncementBar({data}: any) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const isHome = useIsHomePath();

  const {announcements, slideInterval} = data;
  const index = wrap(0, announcements.length, page);
  const announcement = announcements[index];

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

  const swipeProps = {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 1,
    onDragStart: () => {
      setIsDragging(true);
    },
    onDragEnd: (e: any, {offset, velocity}: any) => {
      const swipe = swipePower(offset.x, velocity.x);
      
      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
      
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div
      className={`h-12 overflow-hidden sticky top-0 z-50 ${
        isHome ? 'bg-contrast' : 'bg-primary'
      }`}
    >
      <motion.div 
        className="relative h-full"
        {...swipeProps}
      >
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="popLayout"
        >
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={`absolute inset-0 flex h-12 w-full items-center justify-center px-4 text-center position-absolute ${
              isHome ? 'text-primary' : 'text-contrast'
            }`}
          >
            {announcement.link ? (
              <a 
                href={announcement.link}
                onClick={(e) => isDragging && e.preventDefault()}
                className="block w-full text-center"
              >
                <span className="text-sm sm:text-base">{announcement.title}</span>
              </a>
            ) : (
              <span className="text-sm sm:text-base">{announcement.title}</span>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
