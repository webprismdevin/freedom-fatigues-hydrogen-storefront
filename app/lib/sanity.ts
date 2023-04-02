import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {z} from 'zod';
import groq from 'groq';

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
      (_type == 'collectionGroup') => {
        ${COLLECTION_GROUP}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  }`;

  return sanity.fetch(query);
}

export const COLOR_THEME = groq`
  'background': background.hex,
  'text': text.hex,
`;

export const COLLECTION = groq`
  _id,
  colorTheme->{
    ${COLOR_THEME}
  },
  "gid": collection->store.gid,
  "slug": "/collections/" + collection->store.slug.current,
  "vector": collection->vector.asset->url,
`;

export const COLLECTION_GROUP = groq`
  _key,
  _type,
  ...,
  collectionLinks[]{
    _key,
    megaMenuFeatures,
    "title": displayTitle,
    ${COLLECTION}
  },
  collectionProducts->{
    ${COLLECTION}
  },
  title,
`;

export const LINK_INTERNAL = groq`
  _key,
  _type,
  title,
  ...reference-> {
    "documentType": _type,
    (_type == "collection") => {
      "slug": "/collections/" + store.slug.current,
    },
    (_type == "home") => {
      "slug": "/",
    },
    (_type == "page") => {
      "slug": "/pages/" + slug.current,
    },
    (_type == "product" && store.isEnabled && store.status == "active") => {
      "slug": "/products/" + store.slug.current,
    },
  }
`;
