// Authentication service: login/logout/refresh/me helpers
import api from '../lib/axios'
import { httpClient } from './http'
import { useUserStore } from '../stores/userStore'
import { setTokens, clearTokens, getRememberMe } from '../lib/tokenStorage'

// Log in via local API, persist tokens and normalize user into store
export async function login(payload) {
  const res = await httpClient.post('/users/login', payload)
  const a = res.data?.accessToken
  const r = res.data?.refreshToken
  const remember = !!payload.remember
  setTokens(a, r, remember)

  const rawUser = res.data?.user ?? res.data
  const mapped = {
    role: rawUser?.role ?? null,
    user_id: Number(rawUser?.user_id ?? rawUser?.id ?? 0),
    username: String(rawUser?.username ?? ''),
  }

  if (!mapped.user_id || !mapped.username) {
    throw new Error('Invalid user structure: requires user_id and username')
  }

  try {
    const storeExists = !!localStorage.getItem('userStore')
    const { setUser } = useUserStore.getState()
    setUser(mapped)
    if (!storeExists && !localStorage.getItem('userStore')) {
      throw new Error('Failed to create userStore')
    }
  } catch (e) {
    clearTokens()
    throw e instanceof Error ? e : new Error('Failed to update userStore')
  }

  return res.data
}

// Logout: best-effort server call, then clear tokens
export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch {}
  clearTokens()
}

// Refresh tokens using axios client
export async function refresh() {
  const res = await api.post('/auth/refresh', {})
  const a = res.data?.accessToken
  const r = res.data?.refreshToken
  const remember = getRememberMe()
  setTokens(a, r, remember)
  return res.data
}

// Get current user from backend
export async function me() {
  const res = await api.get('/auth/me')
  return res.data
}
