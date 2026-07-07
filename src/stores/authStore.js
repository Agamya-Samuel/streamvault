import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  signUp: async (email, password) => {
    set({ error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  signInWithGoogle: async () => {
    set({ error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      set({ error: err.message });
    }
  },

  initListener: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));

export default useAuthStore;
