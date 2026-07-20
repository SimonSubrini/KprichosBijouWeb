import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product, quantity = 1, customizations = null) => {
    set((state) => {
      // Basic implementation for now
      const existingItem = state.items.find(
        (item) => item.product._id === product._id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item === existingItem ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }

      return { items: [...state.items, { product, quantity, customizations, id: Date.now().toString() }] };
    });
  },
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },
  updateQuantity: (itemId, delta) => {
    set((state) => {
      return {
        items: state.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
          }
          return item;
        })
      };
    });
  },
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    return get().items.reduce((total, item) => total + item.product.basePrice * item.quantity, 0);
  },
}));
