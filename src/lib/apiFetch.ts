import { useAuthStore } from '@/store/authStore'

export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiFetch(url: string, init: RequestInit = {}, timeoutMs = 15_000): Promise<Response> {
  const token = useAuthStore.getState().token ?? ''
  console.log('[DEBUG] apiFetch →', url, '| token:', token ? '✅' : '❌ MISSING')

  // Aborta requests penduradas (ex: backend aguardando Supabase pausado)
  const controller = new AbortController()
  const timer = setTimeout(() => {
    console.warn('[DEBUG] apiFetch TIMEOUT —', url)
    controller.abort()
  }, timeoutMs)

  return fetch(url, {
    ...init,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).finally(() => clearTimeout(timer))
}
