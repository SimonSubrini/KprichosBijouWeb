import { createClient } from '@sanity/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in cart' });
  }

  const client = createClient({
    projectId: 'ib60inz2',
    dataset: 'production',
    useCdn: false, // Bypass cache to write immediately
    apiVersion: '2024-03-01',
    token: process.env.SANITY_API_TOKEN,
  });

  try {
    // 1. Create the Order document
    const orderData = {
      _type: 'order',
      orderId: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalPrice: total,
      status: 'pendiente',
      items: items.map(item => ({
        _type: 'object',
        _key: item.id || Math.random().toString(36).substring(7),
        product: {
          _type: 'reference',
          _ref: item.product._id
        },
        quantity: item.quantity,
        customizations: item.customizations || ''
      }))
    };

    await client.create(orderData);

    // 2. Decrement stock for 'stock' products
    const transaction = client.transaction();
    let hasStockUpdates = false;

    for (const item of items) {
      if (item.product.type === 'stock') {
        transaction.patch(item.product._id, p => p.dec({ stockCount: item.quantity }));
        hasStockUpdates = true;
      }
    }

    if (hasStockUpdates) {
      await transaction.commit();
    }

    return res.status(200).json({ success: true, message: 'Order saved and stock updated.' });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return res.status(500).json({ success: false, message: 'Failed to process order', error: error.message });
  }
}
