import { describe, it, expect, beforeEach } from 'vitest';

import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';

describe('cartStore logic', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should add an item to the cart', () => {
    const store = useCartStore.getState();
    const product = { _id: '1', name: 'Test Product', basePrice: 100 };
    
    // add item
    store.addItem(product, 2);
    const updatedStore = useCartStore.getState();
    
    expect(updatedStore.items.length).toBe(1);
    expect(updatedStore.items[0].quantity).toBe(2);
    expect(updatedStore.items[0].product.basePrice).toBe(100);
  });

  it('should correctly calculate the total without discounts', () => {
    const store = useCartStore.getState();
    store.addItem({ _id: '1', name: 'Product A', basePrice: 100 }, 2);
    store.addItem({ _id: '2', name: 'Product B', basePrice: 200 }, 1);
    
    const updatedStore = useCartStore.getState();
    expect(updatedStore.getCartTotal()).toBe(400);
  });
});
