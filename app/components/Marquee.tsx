import {urlFor} from '~/lib/sanity';

export default function Marquee({data}: {data: any}) {
  return (
    <div className="flex w-full items-stretch justify-start gap-4 overflow-hidden py-6">
      <MarqueeContent data={data} />
      <MarqueeContent data={data} />
      <MarqueeContent data={data} />
      <MarqueeContent data={data} />
    </div>
  );
}

function MarqueeContent({data}: {data: any}) {
  return (
    <>
      {data?.items?.map((item: string, index: number) => (
        <div
          className="scroll flex h-12 shrink-0 grow-0 items-center justify-start gap-4 uppercase"
          key={index}
        >
          <span className="whitespace-nowrap font-heading text-4xl">
            {item}
          </span>
          <img
            src={urlFor(data.icon).url()}
            width="36px"
            height="36px"
            alt="decorative icon"
            loading="lazy"
          />
        </div>
      ))}
      {data?.items?.map((item: string, index: number) => (
        <div
          className="scroll flex h-12 shrink-0 grow-0 items-center justify-start gap-4 uppercase"
          key={index}
        >
          <span className="whitespace-nowrap font-heading text-4xl">
            {item}
          </span>
          <img
            src={urlFor(data.icon).url()}
            width="36px"
            height="36px"
            alt="decorative icon"
            loading="lazy"
          />
        </div>
      ))}
    </>
  );
}
