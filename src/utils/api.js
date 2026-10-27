import axios from 'axios'

export const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'

export const API_BASE_URL = API_URL

export const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ||
  API_URL.replace(/\/api\/?$/, '') + '/storage'

/**
 * Universal image URL resolver that supports:
 * - Full URLs (http://, https://, data:)
 * - Relative storage paths (e.g. 'product_images/abc.jpg' or '/storage/...')
 * - Automatically respects the active API_URL (local or deployed Render backend)
 */
export function getImageUrl(imageSrc) {
  if (!imageSrc || typeof imageSrc !== 'string') return null
  const trimmed = imageSrc.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed
  }
  const baseHost = API_URL.replace(/\/api\/?$/, '')
  if (trimmed.startsWith('/')) {
    return `${baseHost}${trimmed}`
  }
  if (trimmed.startsWith('storage/')) {
    return `${baseHost}/${trimmed}`
  }
  return `${baseHost}/storage/${trimmed}`
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Automatically attach Bearer token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
