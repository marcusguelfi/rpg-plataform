'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        setUser(data.user || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [setUser, setLoading])

  return <>{children}</>
}
