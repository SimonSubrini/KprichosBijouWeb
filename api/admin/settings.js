import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ib60inz2',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
  token: process.env.SANITY_API_TOKEN,
});

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const settings = await client.fetch('*[_id == "storeSettings" || _type == "storeSettings"][0]');
      return res.status(200).json(settings || { customOrdersSuspended: false, suspensionMessage: '' });
    } 
    
    if (req.method === 'PUT' || req.method === 'POST') {
      const { customOrdersSuspended, suspensionMessage } = req.body;
      
      const doc = {
        _id: 'storeSettings',
        _type: 'storeSettings',
        customOrdersSuspended: Boolean(customOrdersSuspended),
        suspensionMessage: suspensionMessage || ''
      };

      const updated = await client.createOrReplace(doc);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling store settings:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
