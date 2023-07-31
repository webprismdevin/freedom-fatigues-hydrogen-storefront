export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const PRODUCT_METAFIELD_FRAGMENT = `#graphql
  fragment Metafields on Product {
    avg_rating: metafield(namespace: "loox", key: "avg_rating") {
      value
    }
    num_reviews: metafield(namespace: "loox", key: "num_reviews") {
      value
    }
    caption: metafield(namespace: "page", key: "caption") {
      value
    }
    fabric_fit: metafield(namespace: "page", key: "fabric_fit") {
      value
    }
    complete_the_look: metafield(namespace: "custom", key: "complete_the_look") {
      references(first:10) {
        nodes {
          __typename
          ...ProductCard
        }
      }
    }
  }`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    publishedAt
    availableForSale
    handle
    tags
    options {
      name
      values
    }
    avg_rating: metafield(namespace: "loox", key: "avg_rating") {
      value
    }
    num_reviews: metafield(namespace: "loox", key: "num_reviews") {
      value
    }
    caption: metafield(namespace: "page", key: "caption") {
      value
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;
