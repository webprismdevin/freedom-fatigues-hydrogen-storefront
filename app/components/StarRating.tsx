export default function StarRating({
  rating,
  count,
}: {
  rating?: number;
  count?: number;
}) {
  if (!rating || !count) return null;

  return (
    <div className="flex flex-row items-center">
      {[...Array(5)].map((_, i) => (
        <IconStar key={i} />
      ))}{' '}
      <span className=" ml-2 text-xs text-slate-500">
        {rating} [{count}]
      </span>
    </div>
  );
}

export function IconStar({size}: {size?: number}) {
  return (
    // <svg
    //   width={size ? `${size}px` : '16px'}
    //   height={size ? `${size}px` : '16px'}
    //   strokeWidth="1.5"
    //   viewBox="0 0 24 24"
    //   fill="#FFCC66"
    //   xmlns="http://www.w3.org/2000/svg"
    //   color="#FFCC66"
    // >
    //   <path
    //     d="M8.587 8.236l2.598-5.232a.911.911 0 011.63 0l2.598 5.232 5.808.844a.902.902 0 01.503 1.542l-4.202 4.07.992 5.75c.127.738-.653 1.3-1.32.952L12 18.678l-5.195 2.716c-.666.349-1.446-.214-1.319-.953l.992-5.75-4.202-4.07a.902.902 0 01.503-1.54l5.808-.845z"
    //     stroke="#FFCC66"
    //     strokeWidth="1.5"
    //     strokeLinecap="butt"
    //     strokeLinejoin="miter"
    //   ></path>
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 96 960 960"
      width={size ? `${size}px` : '16px'}
      height={size ? `${size}px` : '16px'}
      fill="#FFCC66"
    >
      <path d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
    </svg>
  );
}
