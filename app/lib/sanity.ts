import {SanityImageAssetDocument, createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {z} from 'zod';
import groq from 'groq';

export const sanity = createClient({
  projectId: 'd7y2vv8s',
  dataset: 'production',
  useCdn: process.env.NODE_ENV === 'production' ? true : false,
});

const builder = imageUrlBuilder(sanity);

export const urlFor = (source: SanityImageAssetDocument) => {
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
    },
    "footerText": footer.text,
    "footerMenu": footer.links[]{
      title,
      _type,
      _key,
      (_type == 'collectionGroup') => {
        collectionLinks[]{
          _key,
          "title": displayTitle,
          "gid": collection->store.gid,
          ${COLLECTION_LINK},
          "vector": collection->vector.asset->url,
        }
      },
      (_type == 'linkGroup') => {
        links[] {
          title,
          (_type == 'linkExternal')=>{
            _key,
            "to": url,
            newWindow
          },
          (_type == 'link')=>{
            "to": "/pages/" + link->slug.current
          }
        }
      }
    },
    "announcements": announcements[],
  }`;

  return sanity.fetch(query);
}

export const COLLECTION = groq`
  _id,
  "gid": collection->store.gid,
  "slug": "/collections/" + collection->store.slug.current,
  "vector": collection->vector.asset->url,
`;

const COLLECTION_LINK = groq`
"to":'/collections/' + collection->store.slug.current`;

export const LINK = groq`
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
`;

export const LINK_INTERNAL = groq`
  _key,
  _type,
  title,
  ...reference-> {
    ${LINK}
  }
`;

export const COLLECTION_GROUP = groq`
  _key,
  _type,
  ...,
  megaMenuFeatures[]{
    _key,
    title,
    image,
    link->{
      ${LINK}
    }
  },
  collectionLinks[]{
    _key,
    "title": displayTitle,
    ${COLLECTION}
  },
  collectionProducts->{
    ${COLLECTION}
  },
  megaMenuTitle {
    title,
    ${COLLECTION_LINK}
  },
  title,
`;

export const LINK_EXTERNAL = groq`
    _key,
    _type,
    newWindow,
    title,
    url,
`;

export const CTA_FRAGMENT = groq`
  cta {
    "text": title,
    ...reference-> {
      "documentType": _type,
      (_type == "collection") => {
        "to": "/collections/" + store.slug.current,
      },
      (_type == "home") => {
        "to": "/",
      },
      (_type == "page") => {
        "to": "/pages/" + slug.current,
      },
      (_type == "product" && store.isEnabled && store.status == "active") => {
        "to": "/products/" + store.slug.current,
      },
    }
  }
`;

//homepage fragments
export const HERO_FRAGMENT = groq`
    ...,
    image {
      ...,
      "height": asset-> metadata.dimensions.height,
      "width": asset-> metadata.dimensions.width
    },
    ${CTA_FRAGMENT}
`;

export const MODULE_FRAGMENT = groq`
modules[]{
  ...,
  _type,
  (_type == 'component.swimlane') => {
      "gid": collection->store.gid,
      "to": "/collections/" + collection->store.slug.current,
      "handle": collection->store.slug.current,
  },
  (_type == 'component.hero') => {
    ${HERO_FRAGMENT}
  },
  (_type == 'component.slides') => {
    ...,
    slides[]{
      ...,
      ${CTA_FRAGMENT},
      image {
        ...,
        "height": asset-> metadata.dimensions.height,
        "width": asset-> metadata.dimensions.width
      },
      image2 {
        ...,
        "height": asset-> metadata.dimensions.height,
        "width": asset-> metadata.dimensions.width
      }
    }
  },
  (_type == 'component.collectionGrid') => {
    ...,
    collections[]{
      ...,
      ${COLLECTION_LINK}
    }
  },
  (_type == 'component.textWithImage') => {
    ...,
    ${CTA_FRAGMENT}
  }
}
`;
