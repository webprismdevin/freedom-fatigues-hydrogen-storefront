export default function ShippingAndReturns() {
  return (
    <div className="align-center grid grid-cols-3 p-12">
      <div className="col-span-1 grid place-items-center">
        <div className="text-center">
          <h1 className="font-heading text-5xl uppercase">Easy Returns</h1>
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
          <h1 className="font-heading text-5xl uppercase">Free Shipping</h1>
          <p>on orders $99+</p>
        </div>
      </div>
    </div>
  );
}
