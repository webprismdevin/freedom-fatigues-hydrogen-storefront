import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {z} from 'zod';

export const sanity = createClient({
  projectId: 'd7y2vv8s',
  dataset: 'production',
  useCdn: process.env.NODE_ENV === 'production' ? true : false,
});

const builder = imageUrlBuilder(sanity);

export const urlFor = (source: string) => {
  return builder.image(source);
};

export async function getSiteSettings() {
  const query = `*[_type == "settings"][0]{
    "menu": menu.links[] {
      ...,
      _type == "collectionGroup" => {
        ...,
        collectionLinks[]{
          "title": displayTitle,
          "slug": collection->store.slug.current,
          collection-> {
            "slug": store.slug.current,
            "title": store.title,
          }
        }
      },
      _type == "linkInternal" => @.reference-> {
        title,
        "slug": slug.current
      }
    }
  }`;

  return sanity.fetch(query);
}
