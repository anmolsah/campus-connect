import { create } from 'zustand'
import type { Profile } from '../types/database.types'

type Mode = 'study' | 'social' | 'project'

interface UserState {
  user: Profile | null
  currentMode: Mode
  setUser: (user: Profile | null) => void
  setMode: (mode: Mode) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  currentMode: 'social',
  setUser: (user) => set({ user }),
  setMode: (currentMode) => set({ currentMode }),
  logout: () => set({ user: null, currentMode: 'social' }),
}))
