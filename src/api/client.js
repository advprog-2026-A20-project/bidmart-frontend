import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const client = axios.create({
  baseURL,
})

if (typeof window !== 'undefined') {
  const token = window.localStorage.getItem('accessToken')
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  }
}

export default client
