import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanity = createClient({
  projectId: 'd7y2vv8s',
  dataset: 'production',
  useCdn: process.env.NODE_ENV === 'production' ? true : false,
});

const builder = imageUrlBuilder(sanity);

export const urlFor = (source: string) => {
  return builder.image(source);
};
