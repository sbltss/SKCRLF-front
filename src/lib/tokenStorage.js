// In-memory token cache with optional localStorage persistence
let accessToken = null
let refreshToken = null
let remember = false

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const REMEMBER_KEY = 'remember_me'

// Initialize cache from localStorage based on remember flag
export function loadFromStorage() {
  const r = localStorage.getItem(REMEMBER_KEY)
  remember = r === 'true'
  if (remember) {
    accessToken = localStorage.getItem(ACCESS_KEY)
    refreshToken = localStorage.getItem(REFRESH_KEY)
  }
}

// Update tokens and optionally persist to localStorage
export function setTokens(a, r, persist) {
  accessToken = a || null
  refreshToken = r || null
  remember = !!persist
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
  if (remember) {
    if (a) localStorage.setItem(ACCESS_KEY, a)
    else localStorage.removeItem(ACCESS_KEY)
    if (r) localStorage.setItem(REFRESH_KEY, r)
    else localStorage.removeItem(REFRESH_KEY)
  } else {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }
}

// Clear tokens from memory and storage
export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// Return current access token (in-memory)
export function getAccessToken() {
  return accessToken
}

// Return current refresh token (in-memory)
export function getRefreshToken() {
  return refreshToken
}

// Whether tokens are persisted between sessions
export function getRememberMe() {
  return remember
}

// Initialize module state on load
loadFromStorage()
