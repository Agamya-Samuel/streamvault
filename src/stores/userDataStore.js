import { create } from 'zustand';
import { getUserData, putUserData } from '../cache/db';

const useUserDataStore = create((set, get) => ({
  uid: null,
  watchlist: [],
  history: [],

  loadFromDB: async (uid) => {
    let data = await getUserData(uid);
    if (!data) {
      data = { uid, watchlist: [], history: [] };
      await putUserData(data);
    }
    set({ uid, watchlist: data.watchlist, history: data.history });
  },

  addToWatchlist: async (showId) => {
    const { uid, watchlist } = get();
    if (watchlist.includes(showId)) return;
    const updated = [...watchlist, showId];
    set({ watchlist: updated });
    if (uid) await putUserData({ uid, watchlist: updated, history: get().history });
  },

  removeFromWatchlist: async (showId) => {
    const { uid, watchlist } = get();
    const updated = watchlist.filter((id) => id !== showId);
    set({ watchlist: updated });
    if (uid) await putUserData({ uid, watchlist: updated, history: get().history });
  },

  addToHistory: async (showId) => {
    const { uid, history } = get();
    const entry = { showId, watchedAt: Date.now() };
    const updated = [entry, ...history.filter((h) => h.showId !== showId)];
    set({ history: updated });
    if (uid) await putUserData({ uid, watchlist: get().watchlist, history: updated });
  },

  clear: () => set({ uid: null, watchlist: [], history: [] }),
}));

export default useUserDataStore;
