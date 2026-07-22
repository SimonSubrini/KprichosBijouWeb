import { createClient } from '@sanity/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const client = createClient({
    projectId: 'ib60inz2',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-03-01',
    token: process.env.SANITY_API_TOKEN,
  });

  try {
    const query = `*[_type == "order"] | order(createdAt desc) {
      _id,
      orderId,
      createdAt,
      status,
      paymentStatus,
      amountPaid,
      totalPrice,
      customerInfo,
      items[]{
        quantity,
        customizations,
        selectedModel,
        product->{
          _id,
          name,
          type,
          hasModels,
          models,
          "imageUrl": images[0].asset->url
        }
      }
    }`;
    const orders = await client.fetch(query);
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
}
