import axios from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('lmap_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !err.config.url.startsWith('/auth/')) {
      localStorage.removeItem('lmap_token')
      localStorage.removeItem('lmap_user')
      window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname)
    }
    return Promise.reject(err)
  }
)

export default api
