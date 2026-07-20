import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'ib60inz2',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-03-01', // Using a recent stable API version
});

export const fetchProducts = async () => {
  const query = `*[_type == "product"]{
    _id,
    name,
    description,
    basePrice,
    type,
    stockCount,
    customizationOptions,
    "imageUrls": images[].asset->url
  }`;
  return await sanityClient.fetch(query);
};
