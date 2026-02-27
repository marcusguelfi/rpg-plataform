import { create } from 'zustand'

export interface AuthUser {
  id: string
  username: string
  role: string
  avatar?: string | null
  email?: string | null
}

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null })
    window.location.href = '/'
  },
}))
