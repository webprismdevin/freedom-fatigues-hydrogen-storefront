export default function Marquee() {
  return (
    <div className="align-stretch flex w-full justify-start gap-4 overflow-hidden py-6">
      <MarqueeContent key={1} />
      <MarqueeContent key={2} />
      <MarqueeContent key={3} />
      <MarqueeContent key={4} />
    </div>
  );
}

function MarqueeContent() {
  return (
    <div className="scroll flex h-12 flex-shrink-0 flex-grow-0 justify-start gap-4 uppercase text-white">
      <span className="whitespace-nowrap font-heading text-4xl">
        American Made
      </span>
      <svg
        width="36px"
        height="36px"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        color="white"
      >
        <path
          d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
      <span className="whitespace-nowrap font-heading text-4xl uppercase">
        Veteran Owned
      </span>
      <svg
        width="36px"
        height="36px"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        color="white"
      >
        <path
          d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </div>
  );
}
