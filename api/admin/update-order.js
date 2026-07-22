import { createClient } from '@sanity/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { orderId, status, paymentStatus, amountPaid } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Missing orderId' });
  }

  const client = createClient({
    projectId: 'ib60inz2',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-03-01',
    token: process.env.SANITY_API_TOKEN,
  });

  try {
    const currentOrder = await client.getDocument(orderId);
    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const transaction = client.transaction();
    
    // Si cancelamos, debemos devolver el stock
    if (status === 'cancelado' && currentOrder.status !== 'cancelado') {
      const query = `*[_type == "order" && _id == $id][0]{
        items[]{
          quantity,
          selectedModel,
          product->{
            _id,
            type,
            hasModels,
            models
          }
        }
      }`;
      const orderDetails = await client.fetch(query, { id: orderId });
      
      if (orderDetails && orderDetails.items) {
        for (const item of orderDetails.items) {
          if (item.product && item.product.type === 'stock') {
            if (item.product.hasModels && item.selectedModel) {
              const modelIndex = item.product.models?.findIndex(m => m.name === item.selectedModel);
              if (modelIndex !== undefined && modelIndex !== -1) {
                transaction.patch(item.product._id, p => p.inc({ [`models[${modelIndex}].stockCount`]: item.quantity }));
              }
            } else {
              transaction.patch(item.product._id, p => p.inc({ stockCount: item.quantity }));
            }
          }
        }
      }
    }

    // Actualizar la orden
    transaction.patch(orderId, p => {
      const updates = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (amountPaid !== undefined) updates.amountPaid = amountPaid;
      return p.set(updates);
    });

    await transaction.commit();
    
    return res.status(200).json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
}
