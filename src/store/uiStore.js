import { create } from 'zustand';

const initialFilters = {
  query: '',
  area: '',
  type: '',
  capacity: '',
  priceRange: '', // 'low' (under 1.5k), 'mid' (1.5k-3k), 'high' (over 3k)
  date: '',
  slot: ''
};

export const useUiStore = create((set) => ({
  toast: null, // { message: '', type: 'success' | 'error' | 'info' }
  filters: initialFilters,
  
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
  },
  
  clearToast: () => set({ toast: null }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  resetFilters: () => set({ filters: initialFilters })
}));
