import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Mode } from '../types';

interface UserState {
  user: Profile | null;
  currentMode: Mode;
  showOwnCampusOnly: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setMode: (mode: Mode) => void;
  setShowOwnCampusOnly: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      currentMode: 'social',
      showOwnCampusOnly: false,
      isLoading: true,
      setUser: (user) => set({
        user,
        isLoading: false,
        showOwnCampusOnly: user?.show_own_campus_only ?? false,
      }),
      setMode: (currentMode) => set({ currentMode }),
      setShowOwnCampusOnly: (showOwnCampusOnly) => set({ showOwnCampusOnly }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => set({ user: null, currentMode: 'social', showOwnCampusOnly: false, isLoading: false }),
    }),
    {
      name: 'campus-connect-user',
      partialize: (state) => ({
        currentMode: state.currentMode,
        showOwnCampusOnly: state.showOwnCampusOnly,
      }),
    }
  )
);
