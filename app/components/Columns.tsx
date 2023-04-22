import {Image} from '@shopify/hydrogen';
import {urlFor} from '~/lib/sanity';

export function Columns({
  data,
}: {
  data: {
    columns: [
      {
        title: string;
        content: string;
      },
    ];
  };
}) {
  return (
    <section className="bg-slate-100 p-8 md:p-12 lg:p-24">
      <div
        className={`grid grid-cols-1 gap-12 md:grid-cols-${data.columns.length}`}
      >
        {data.columns.map((item: any) => (
          <div key={item.title} className="mx-auto max-w-[400px]">
            {item.image && (
              <div className="card-image mb-4 aspect-square">
                <Image
                  src={urlFor(item.image).url()}
                  sizes="50vw"
                  aspectRatio="1/1"
                  alt={item.image?.alt}
                />
              </div>
            )}
            <h3 className="mb-4 text-center text-2xl font-bold md:text-3xl">
              {item.title}
            </h3>
            <p className="text-center">{item.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const defaultColumnData = [
  {
    title: 'Veteran + LEO Owned',
    content:
      "Freedom Fatigues is a veteran and LE owned and operated company producing only American-made apparel and accessories. We don't just print in the USA - we MAKE all our products here!",
  },
  {
    title: 'Supporting First Responders',
    content:
      "With every purchase, we're able to give back to organizations that support the mental health of our veterans and first responders. We're proud to be a partner in the fight against hero suicide.",
  },
  {
    title: 'American-Made',
    content:
      'Our sweatshirts are American-made, right down to the knitting of the fabric, and screen printed in our Detriot, MI warehouse',
  },
];
