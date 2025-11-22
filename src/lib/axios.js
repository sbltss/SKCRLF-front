import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  const csrf = getCookie('XSRF-TOKEN')
  if (csrf) config.headers['X-CSRF-Token'] = csrf
  return config
})

let refreshing = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error
    if (!response) throw error
    if (response.status !== 401) throw error
    if (config.__retry) throw error
    if (!refreshing) {
      const rt = getRefreshToken()
      refreshing = api
        .post('/auth/refresh', rt ? { refreshToken: rt } : {})
        .then((r) => {
          const a = r.data?.accessToken
          const nr = r.data?.refreshToken || rt
          setTokens(a, nr, true)
          return a
        })
        .catch((e) => {
          clearTokens()
          throw e
        })
        .finally(() => {
          refreshing = null
        })
    }
    const newAccess = await refreshing
    if (!newAccess) throw error
    config.__retry = true
    config.headers.Authorization = `Bearer ${newAccess}`
    return api(config)
  }
)

export default api