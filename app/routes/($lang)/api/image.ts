import {imageLoader, MemoryCache} from 'remix-image/serverPure';

const config = {
  selfUrl: 'http://localhost:3000',
  cache: new MemoryCache(),
};

export const loader = ({request}) => {
  return imageLoader(config, request);
};
