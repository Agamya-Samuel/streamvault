import { create } from 'zustand';

// Temporarily mock authentication to disable real Firebase auth
const useAuthStore = create((set) => ({
  user: { email: 'guest@streamvault.com', uid: 'guest-uid' },
  loading: false,
  error: null,

  signUp: async (email, password) => {
    set({ user: { email, uid: 'guest-uid' }, error: null });
  },

  signIn: async (email, password) => {
    set({ user: { email, uid: 'guest-uid' }, error: null });
  },

  signInWithGoogle: async () => {
    set({ user: { email: 'google-guest@streamvault.com', uid: 'guest-uid' }, error: null });
  },

  signOut: async () => {
    set({ user: null });
  },

  initListener: () => {
    return () => {};
  },
}));

export default useAuthStore;
