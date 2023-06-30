import {Image} from '@shopify/hydrogen';
import type {MediaEdge} from '@shopify/hydrogen/storefront-api-types';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import {Video} from '@shopify/hydrogen-react';
import {useScroll, useMotionValueEvent} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
}: {
  media: MediaEdge['node'][];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollXProgress} = useScroll({container: ref});
  const [position, setPosition] = useState<number>(0);

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    const clamped = Number(latest.toFixed(2));

    console.log('x changed to', clamped);
    setPosition(clamped as number);
  });

  if (!media.length) {
    return null;
  }

  return (
    <>
      <div
        ref={ref}
        className={`swimlane hiddenScroll md:grid-flow-row md:grid-cols-2 md:overflow-x-auto md:p-0 ${className}`}
      >
        {media.map((med, i) => {
          const isFirst = i === 0;
          const isFourth = i === 3;
          const isFullWidth = i % 3 === 0;

          const data = {
            ...med,
            image: {
              // @ts-ignore
              ...med.image,
              altText: med.alt || 'Product image',
            },
          } as MediaImage;

          const style = [
            isFullWidth ? 'md:col-span-2' : 'md:col-span-1',
            isFirst || isFourth ? '' : 'md:aspect-square',
            'aspect-square snap-center card-image bg-white dark:bg-contrast/10 w-mobileGallery md:w-full',
          ].join(' ');

          if (med.__typename === 'Video')
            return (
              <div
                key={med.id}
                className={
                  'card-image aspect-square w-mobileGallery snap-center bg-white dark:bg-contrast/10 md:w-full'
                }
              >
                <Video
                  autoPlay
                  // poster={med.previewImage?.url}
                  playsInline
                  loop
                  muted
                  controls={false}
                  data={med}
                  data-poster={med.previewImage?.url}
                  className="lozad fadeIn aspect-square h-full w-full object-cover"
                />
              </div>
            );

          return (
            <div
              className={style}
              // @ts-ignore
              key={med.id || med.image.id}
            >
              {(med as MediaImage).image && (
                <Image
                  loading={i === 0 ? 'eager' : 'lazy'}
                  data={data.image!}
                  aspectRatio={!isFirst && !isFourth ? '1/1' : undefined}
                  sizes={
                    isFirst || isFourth
                      ? '(min-width: 48em) 60vw, 90vw'
                      : '(min-width: 48em) 30vw, 90vw'
                  }
                  className="fadeIn aspect-square h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
      {/* <div className="flex h-4 w-full justify-center gap-2">
        {media.map((med, i) => (
          <div
            data-key={i / media.length}
            key={i}
            className={`h-1 w-4 rounded-full bg-black/20 `}
          >
            &#x200B;
          </div>
        ))}
      </div> */}
    </>
  );
}
