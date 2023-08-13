export default function StarRating({
  rating,
  count,
}: {
  rating: number;
  count?: number | string | null | undefined;
}) {
  if (!rating) return (
    <div className="flex flex-row items-center">
      <IconStar color={"#e5d5d5"} />
      <IconStar color={"#e5d5d5"} />
      <IconStar color={"#e5d5d5"} />
      <IconStar color={"#e5d5d5"} />
      <IconStar color={"#e5d5d5"} />
      <span className="ml-2 text-xs text-slate-500">
        [0]
      </span>
    </div>
  );

  return (
    <div className="flex flex-row items-center">
      {[...Array(Math.ceil(rating))].map((_, i) => (
        <IconStar key={i} />
      ))}{' '}
      <span className="ml-2 text-xs text-slate-500">
        {rating} {count && `[${count}]`}
      </span>
    </div>
  );
}

export function IconStar({size, color}: {size?: number, color?:string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 96 960 960"
      width={size ? `${size}px` : '16px'}
      height={size ? `${size}px` : '16px'}
      fill={color ? color : "#FFCC66"}
    >
      <path d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
    </svg>
  );
}
