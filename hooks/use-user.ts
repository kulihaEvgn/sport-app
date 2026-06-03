import { useQuery } from '@tanstack/react-query'
import type { User } from '@/types'
import { apiFetch } from '@/lib/api-client'

export function useUser() {
  return useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: () => apiFetch<User>('/api/auth/me'),
    staleTime: 5 * 60 * 1000,
  })
}
