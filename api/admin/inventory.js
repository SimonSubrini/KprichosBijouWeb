import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ib60inz2',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
  token: process.env.SANITY_API_TOKEN,
});

// Helper para limpiar campos virtuales de lectura (urls de imágenes o expansiones de consulta GROQ) antes de guardar en Sanity
function cleanSanityData(data) {
  if (Array.isArray(data)) {
    return data.map(item => cleanSanityData(item));
  }
  if (data !== null && typeof data === 'object') {
    const cleaned = { ...data };
    delete cleaned.imageUrl;
    delete cleaned.imageUrls;
    delete cleaned.accessoryRefId;
    
    for (const key in cleaned) {
      cleaned[key] = cleanSanityData(cleaned[key]);
    }
    return cleaned;
  }
  return data;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Obtener todo el inventario, enriquecido con URLs de fotos para vista previa en el editor Admin
      const query = `{
        "products": *[_type == "product"] | order(_createdAt desc) {
          ...,
          "imageUrls": images[].asset->url,
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
            },
            "accessoryRefId": accessoryReference._ref
          }
        },
        "accessories": *[_type == "accessory"] | order(_createdAt desc) {
          ...,
          options[]{
            ...,
            "imageUrl": image.asset->url
          }
        }
      }`;
      const data = await client.fetch(query);
      return res.status(200).json(data);
    } 
    
    if (req.method === 'POST') {
      // Crear un nuevo documento
      const { _type, ...documentData } = req.body;
      if (!_type) return res.status(400).json({ message: 'Missing _type' });
      
      const cleanedData = cleanSanityData(documentData);
      
      const newDoc = await client.create({
        _type,
        ...cleanedData,
        isArchived: false
      });
      return res.status(201).json({ success: true, document: newDoc });
    }

    if (req.method === 'PUT') {
      // Actualizar documento existente
      const { _id, ...updates } = req.body;
      if (!_id) return res.status(400).json({ message: 'Missing _id' });

      // Eliminamos campos que Sanity no permite actualizar directamente si vienen en el body
      delete updates._type;
      delete updates._createdAt;
      delete updates._updatedAt;
      delete updates._rev;

      const cleanedUpdates = cleanSanityData(updates);

      const updatedDoc = await client.patch(_id).set(cleanedUpdates).commit();
      return res.status(200).json({ success: true, document: updatedDoc });
    }

    if (req.method === 'DELETE') {
      // Soft Delete (Archivar)
      const { _id } = req.query;
      if (!_id) return res.status(400).json({ message: 'Missing _id' });

      const updatedDoc = await client.patch(_id).set({ isArchived: true }).commit();
      return res.status(200).json({ success: true, document: updatedDoc });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Inventory API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
