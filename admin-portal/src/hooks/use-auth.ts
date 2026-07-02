'use client'

import { useAuth } from '@/providers/auth-provider'

export function useCurrentUser() {
  return useAuth()
}
