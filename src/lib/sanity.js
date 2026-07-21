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
    hasModels,
    models,
    customizationOptions[]{
      ...,
      listOptions[]{
        ...,
        "imageUrl": image.asset->url
      },
      nestedOptions[]{
        ...,
        childChoices[]{
          ...,
          "imageUrl": image.asset->url
        }
      }
    },
    "imageUrls": images[].asset->url
  }`;
  return await sanityClient.fetch(query);
};

export const fetchProductById = async (id) => {
  const query = `*[_type == "product" && _id == $id][0]{
    _id,
    name,
    description,
    longDescription,
    basePrice,
    type,
    stockCount,
    hasModels,
    models,
    customizationOptions[]{
      ...,
      listOptions[]{
        ...,
        "imageUrl": image.asset->url
      },
      nestedOptions[]{
        ...,
        childChoices[]{
          ...,
          "imageUrl": image.asset->url
        }
      }
    },
    "imageUrls": images[].asset->url
  }`;
  return await sanityClient.fetch(query, { id });
};
