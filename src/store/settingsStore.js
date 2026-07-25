import { create } from 'zustand';
import { fetchStoreSettings } from '../lib/sanity';

export const useSettingsStore = create((set) => ({
  customOrdersSuspended: false,
  suspensionMessage: '',
  isLoading: true,
  isModalDismissed: !!sessionStorage.getItem('customOrdersModalDismissed'),
  
  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchStoreSettings();
      set({
        customOrdersSuspended: Boolean(data?.customOrdersSuspended),
        suspensionMessage: data?.suspensionMessage || '',
        isLoading: false
      });
    } catch (error) {
      console.error("Error cargando la configuración del sitio:", error);
      set({ isLoading: false });
    }
  },

  updateSettingsState: (newSettings) => {
    set({
      customOrdersSuspended: Boolean(newSettings.customOrdersSuspended),
      suspensionMessage: newSettings.suspensionMessage || ''
    });
  },

  dismissModal: () => {
    sessionStorage.setItem('customOrdersModalDismissed', 'true');
    set({ isModalDismissed: true });
  }
}));
