import { createClient } from '@sanity/client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

const client = createClient({
  projectId: 'ib60inz2',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
  token: process.env.SANITY_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { filename, contentType, base64 } = req.body;
    
    if (!base64 || !contentType) {
      return res.status(400).json({ message: 'Missing file data' });
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64');

    // Subir a Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: filename || 'upload.webp',
      contentType: contentType
    });

    return res.status(200).json({ success: true, asset });
  } catch (error) {
    console.error('Image Upload API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
