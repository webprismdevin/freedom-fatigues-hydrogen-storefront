import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'd7y2vv8s',
  dataset: 'production',
  useCdn: process.env.NODE_ENV === 'production' ? true : false,
});