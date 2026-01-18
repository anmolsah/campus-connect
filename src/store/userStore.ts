import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  college_name: string;
  major: string;
  graduation_year?: number;
  bio?: string;
  id_card_url?: string;
  is_verified: boolean;
  current_mode: 'study' | 'social' | 'project';
  last_active: string;
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: User | null;
  currentMode: 'study' | 'social' | 'project';
  setUser: (user: User | null) => void;
  setMode: (mode: 'study' | 'social' | 'project') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      currentMode: 'social',
      setUser: (user) => set({ user, currentMode: user?.current_mode || 'social' }),
      setMode: (currentMode) => set({ currentMode }),
      logout: () => set({ user: null, currentMode: 'social' }),
    }),
    {
      name: 'campus-connect-user',
    }
  )
);
