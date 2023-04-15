export default function ShippingAndReturns({mode}: {mode?: 'light' | 'dark'}) {
  const titleClass = 'font-heading text-3xl uppercase md:text-5xl';

  if (mode === 'light') {
    return (
      <div className="align-center grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1 grid place-items-center">
          <div className="text-center">
            <h1 className={titleClass}>Easy Returns</h1>
            <p>and exchanges</p>
          </div>
        </div>
        <div className="col-span-1 grid place-items-center">
          <img
            src={'/branding/ff_flag_standard_branded.png'}
            height={166 / 1.5}
            width={200 / 1.5}
            loading="lazy"
            alt="Freedom Fatigues branded American flag"
          />
        </div>
        <div className="col-span-1 grid place-items-center">
          <div className="text-center">
            <h1 className={titleClass}>Free Shipping</h1>
            <p>on orders $99+</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="align-center grid grid-cols-1 gap-4 p-12 md:grid-cols-3 ">
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h1 className={titleClass}>Easy Returns</h1>
          <p>and exchanges</p>
        </div>
      </div>
      <div className="col-span-1 grid place-items-center">
        <img
          src={'/branding/ff_flag_standard_branded.png'}
          height={166 / 1.5}
          width={200 / 1.5}
          loading="lazy"
          alt="Freedom Fatigues branded American flag"
        />
      </div>
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h1 className={titleClass}>Free Shipping</h1>
          <p>on orders $99+</p>
        </div>
      </div>
    </div>
  );
}
