import axios from 'axios'

const api = axios.create({
  baseURL: 'https://mini-store-api-n8xl.onrender.com/api',
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

