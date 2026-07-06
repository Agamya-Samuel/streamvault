import { create } from 'zustand';

const useNetworkStore = create((set, get) => ({
  realOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  mockOffline: false,

  setRealOnline: (online) => set({ realOnline: online }),
  toggleMockOffline: () => set((s) => ({ mockOffline: !s.mockOffline })),
  setMockOffline: (val) => set({ mockOffline: val }),

  get status() {
    const state = get();
    return state.realOnline && !state.mockOffline ? 'online' : 'offline';
  },
}));

export function getNetworkStatus(state) {
  return state.realOnline && !state.mockOffline ? 'online' : 'offline';
}

export default useNetworkStore;
