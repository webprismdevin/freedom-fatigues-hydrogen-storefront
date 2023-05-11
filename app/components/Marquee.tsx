import {Fragment} from 'react';
import {urlFor} from '~/lib/sanity';

export default function Marquee({data}: {data: any}) {
  return (
    <div className="flex select-none gap-[1rem] overflow-hidden py-4">
      <div className="scroll flex min-w-full flex-shrink-0 items-center justify-around gap-[1rem]">
        {data.items.map((item: any) => (
          <Fragment key={item._key + '_1'}>
            <div>
              <span className="font-heading text-4xl uppercase">{item}</span>
            </div>
            <div>
              <img
                src={urlFor(data.icon).url()}
                width="36px"
                height="36px"
                alt="decorative icon"
                loading="lazy"
              />
            </div>
          </Fragment>
        ))}
        {data.items.map((item: any) => (
          <Fragment key={item._key + '_2'}>
            <div>
              <span className="font-heading text-4xl uppercase">{item}</span>
            </div>
            <div>
              <img
                src={urlFor(data.icon).url()}
                width="36px"
                height="36px"
                alt="decorative icon"
                loading="lazy"
              />
            </div>
          </Fragment>
        ))}
      </div>
      <div className="scroll flex min-w-full flex-shrink-0 items-center justify-around gap-[1rem]">
        {data.items.map((item: any) => (
          <Fragment key={item._key + '_3'}>
            <div>
              <span className="font-heading text-4xl uppercase">{item}</span>
            </div>
            <div>
              <img
                src={urlFor(data.icon).url()}
                width="36px"
                height="36px"
                alt="decorative icon"
                loading="lazy"
              />
            </div>
          </Fragment>
        ))}
        {data.items.map((item: any) => (
          <Fragment key={item._key + '_4'}>
            <div>
              <span className="font-heading text-4xl uppercase">{item}</span>
            </div>
            <div>
              <img
                src={urlFor(data.icon).url()}
                width="36px"
                height="36px"
                alt="decorative icon"
                loading="lazy"
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// function MarqueeContent({data}: {data: any}) {
//   return (
//     <>
//       {data?.items?.map((item: string, index: number) => (
//         <div
//           className="scroll flex h-12 shrink-0 grow-0 items-center justify-start gap-4 uppercase"
//           key={index}
//         >
//           <span className="whitespace-nowrap font-heading text-4xl">
//             {item}
//           </span>
//           <img
//             src={urlFor(data.icon).url()}
//             width="36px"
//             height="36px"
//             alt="decorative icon"
//             loading="lazy"
//           />
//         </div>
//       ))}
//       {data?.items?.map((item: string, index: number) => (
//         <div
//           className="scroll flex h-12 shrink-0 grow-0 items-center justify-start gap-4 uppercase"
//           key={index}
//         >
//           <span className="whitespace-nowrap font-heading text-4xl">
//             {item}
//           </span>
//           <img
//             src={urlFor(data.icon).url()}
//             width="36px"
//             height="36px"
//             alt="decorative icon"
//             loading="lazy"
//           />
//         </div>
//       ))}
//     </>
//   );
// }
