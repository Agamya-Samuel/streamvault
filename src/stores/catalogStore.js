import { create } from 'zustand';

const useCatalogStore = create((set) => ({
  totalCount: 0,
  loading: false,
  error: null,
  syncStatus: 'idle',
  showsLoaded: false,

  setTotalCount: (totalCount) => set({ totalCount }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setShowsLoaded: (showsLoaded) => set({ showsLoaded }),
}));

export default useCatalogStore;
