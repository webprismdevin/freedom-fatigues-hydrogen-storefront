import {Link} from '~/components/Link';

export function TextWithImage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-1">
      <div className="p-8 lg:p-24">
        <div>
          <p className="font-heading text-xl lg:text-8xl">AMERICAN</p>
          <p className="font-heading text-5xl">THROUGH AND THROUGH</p>
        </div>
        <div className="mt-4">
          <p className="leading-loose">
            Freedom Fatigues is committed to producing the highest quality
            American-made apparel on the market.
            <br />
            <br />
            We are a conscious American enterprise bent on bringing every piece
            of the apparel manufacturing process back to domestic businesses,
            and American families.
          </p>
          <div className="mt-4">
            <Link to={'/'}>Learn more</Link>
          </div>
        </div>
      </div>
      <div>
        <img
          src={
            'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/mens-patriotic-shirts_d09401ab-5571-414f-8f23-7ed49b2604a6.png?v=1667298623'
          }
          alt=""
        />
      </div>
    </div>
  );
}
