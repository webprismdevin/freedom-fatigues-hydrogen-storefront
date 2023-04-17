import {Link} from '~/components/Link';
import {urlFor} from '~/lib/sanity';

export function TextWithImage({data}: {data: any}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-1"
      key={data._key}
    >
      {data.layout == 'right' && (
        <div>
          <img src={urlFor(data.image).format('webp').url()} alt="" />
        </div>
      )}
      <div className="p-8 lg:p-24">
        <div>
          <p className="font-heading text-6xl lg:text-8xl">{data.title}</p>
          <p className="font-heading text-3xl lg:text-5xl">{data.caption}</p>
        </div>
        <div className="mt-4">
          <div
            dangerouslySetInnerHTML={{
              __html: data.content,
            }}
          />
          {data.cta && (
            <div className="mt-4">
              <Link to={data.cta.to} className="border-b-2 border-white">
                Learn more
              </Link>
            </div>
          )}
        </div>
      </div>
      {data.layout == 'left' && (
        <div>
          <img src={urlFor(data.image).format('webp').url()} alt="" />
        </div>
      )}
    </div>
  );
}
