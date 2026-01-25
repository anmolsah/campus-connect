import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Mode } from '../types';

interface UserState {
  user: Profile | null;
  currentMode: Mode;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setMode: (mode: Mode) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      currentMode: 'social',
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setMode: (currentMode) => set({ currentMode }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => set({ user: null, currentMode: 'social', isLoading: false }),
    }),
    {
      name: 'campus-connect-user',
      partialize: (state) => ({ currentMode: state.currentMode }),
    }
  )
);
