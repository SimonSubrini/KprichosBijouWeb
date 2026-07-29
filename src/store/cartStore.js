import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
  items: [],
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  addItem: (product, quantity = 1, customizations = null, waCustomizations = null) => {
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
          isSidebarOpen: true,
        };
      }

      return { 
        items: [...state.items, { product, quantity, customizations, waCustomizations, id: Date.now().toString() }],
        isSidebarOpen: true,
      };
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
  getCartDiscount: () => {
    return get().items.reduce((discount, item) => {
      if (item.quantity >= 20) {
        return discount + (item.product.basePrice * item.quantity * 0.15);
      } else if (item.quantity >= 10) {
        return discount + (item.product.basePrice * item.quantity * 0.10);
      }
      return discount;
    }, 0);
  },
}), {
  name: 'kprichos-cart-storage',
}));
