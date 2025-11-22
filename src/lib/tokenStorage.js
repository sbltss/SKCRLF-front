let accessToken = null
let refreshToken = null
let remember = false

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const REMEMBER_KEY = 'remember_me'

export function loadFromStorage() {
  const r = localStorage.getItem(REMEMBER_KEY)
  remember = r === 'true'
  if (remember) {
    accessToken = localStorage.getItem(ACCESS_KEY)
    refreshToken = localStorage.getItem(REFRESH_KEY)
  }
}

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

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return refreshToken
}

export function getRememberMe() {
  return remember
}

loadFromStorage()