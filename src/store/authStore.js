import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  adminHash: sessionStorage.getItem('adminHash') || null,
  isAuthenticated: !!sessionStorage.getItem('adminHash'),
  login: (hash) => {
    sessionStorage.setItem('adminHash', hash);
    set({ adminHash: hash, isAuthenticated: true });
  },
  logout: () => {
    sessionStorage.removeItem('adminHash');
    set({ adminHash: null, isAuthenticated: false });
  }
}));
