import {Image} from '@shopify/hydrogen';
import {Link} from '~/components/Link';
import {urlFor} from '~/lib/sanity';
import {RichContent} from './RichContent';

export function TextWithImage({data}: {data: any}) {
  return (
    <div
      className={`flex flex-col lg:flex-row ${data.image ?? 'justify-center'} ${
        data.layout === 'right' && 'lg:flex-row-reverse'
      }`}
      key={data._key}
    >
      <div
        className={`max-w-full self-center p-8 ${
          data.image ? 'lg:max-w-[50%]' : 'lg:max-w-screen-lg'
        } lg:p-24`}
      >
        <div className={`${data.image ?? 'justify-center text-center'}`}>
          <p className="font-heading text-3xl md:text-5xl lg:text-7xl">
            {data.title}
          </p>
          <p className="font-heading text-xl md:text-3xl lg:text-5xl">
            {data.caption}
          </p>
        </div>
        <div className="mt-4">
          {!data.richContent && (
            <div
              dangerouslySetInnerHTML={{
                __html: data.content,
              }}
            />
          )}
          {data.richContent && (
            <div className="max-w-prose">
              <RichContent content={data.richContent} />
            </div>
          )}
          {data.cta && (
            <div className="mt-4">
              <Link to={data.cta.to} className="border-b-2 border-white">
                Learn more
              </Link>
            </div>
          )}
        </div>
      </div>
      {data.image && (
        <div className=" relative aspect-square min-w-[50%]">
          <Image
            src={urlFor(data.image).format('webp').url()}
            alt={data.image.alt ? data.image.alt : 'Image'}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute h-full w-full object-cover object-center"
          />
        </div>
      )}
    </div>
  );
}
