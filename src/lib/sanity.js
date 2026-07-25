import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'ib60inz2',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-03-01', // Using a recent stable API version
});

export const fetchProducts = async () => {
  const query = `*[_type == "product" && coalesce(isArchived, false) == false && coalesce(isDeleted, false) == false]{
    _id,
    name,
    description,
    basePrice,
    type,
    stockCount,
    hasModels,
    models[]{
      ...,
      "imageUrl": image.asset->url
    },
    customizationOptions[]{
      ...,
      listOptions[]{
        ...,
        "imageUrl": image.asset->url
      },
      accessoryReference->{
        _id,
        name,
        stockType,
        options[]{
          _key,
          value,
          stockCount,
          isAvailable,
          "imageUrl": image.asset->url
        }
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
  const query = `*[_type == "product" && _id == $id && coalesce(isArchived, false) == false && coalesce(isDeleted, false) == false][0]{
    _id,
    name,
    description,
    longDescription,
    basePrice,
    type,
    stockCount,
    hasModels,
    models[]{
      ...,
      "imageUrl": image.asset->url
    },
    customizationOptions[]{
      ...,
      listOptions[]{
        ...,
        "imageUrl": image.asset->url
      },
      accessoryReference->{
        _id,
        name,
        stockType,
        options[]{
          _key,
          value,
          stockCount,
          isAvailable,
          "imageUrl": image.asset->url
        }
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
