export const getConsumedStock = (cartItems, excludeItemId = null) => {
  const consumed = {};

  cartItems.forEach(item => {
    if (item.id === excludeItemId) return;

    const qty = item.quantity;

    if (item.product.type === 'stock') {
      if (item.product.hasModels && item.product.selectedModel) {
        const key = `${item.product._id}_model_${item.product.selectedModel}`;
        consumed[key] = (consumed[key] || 0) + qty;
      } else {
        const key = `${item.product._id}_base`;
        consumed[key] = (consumed[key] || 0) + qty;
      }
    }

    if (item.product.accessorySelections) {
      item.product.accessorySelections.forEach(acc => {
        if (acc.stockType === 'finite') {
          const key = `acc_${acc.accessoryId}_${acc.optionValue}`;
          consumed[key] = (consumed[key] || 0) + qty;
        }
      });
    }
  });

  return consumed;
};

export const getTrueMaxAllowed = (product, selectedModel, accessorySelections, cartItems, excludeItemId = null) => {
  const consumed = getConsumedStock(cartItems, excludeItemId);
  let maxAllowed = Infinity;
  let reason = 'este producto o uno de sus accesorios';

  if (product.type === 'stock') {
    if (product.hasModels && selectedModel) {
      const m = product.models?.find(m => m.name === selectedModel);
      const limit = m?.stockCount || Infinity;
      const key = `${product._id}_model_${selectedModel}`;
      const used = consumed[key] || 0;
      const remaining = Math.max(0, limit - used);
      if (remaining < maxAllowed) {
        maxAllowed = remaining;
        reason = `el modelo "${selectedModel}"`;
      }
    } else {
      const limit = product.stockCount || Infinity;
      const key = `${product._id}_base`;
      const used = consumed[key] || 0;
      const remaining = Math.max(0, limit - used);
      if (remaining < maxAllowed) {
        maxAllowed = remaining;
        reason = 'el producto base';
      }
    }
  }

  if (accessorySelections) {
    accessorySelections.forEach(acc => {
      if (acc.stockType === 'finite') {
        const limit = acc.stockCount;
        const key = `acc_${acc.accessoryId}_${acc.optionValue}`;
        const used = consumed[key] || 0;
        const remaining = Math.max(0, limit - used);
        if (remaining < maxAllowed) {
          maxAllowed = remaining;
          reason = `el accesorio "${acc.optionValue}"`;
        }
      }
    });
  }

  return { maxAllowed, reason };
};
