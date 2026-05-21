import axios from 'axios'

const productionGatewayUrl =
  'https://identical-daffy-backendtugasadprokelompoka20-0d961edc.koyeb.app/api'

const localGatewayUrl = 'http://localhost:8080/api'

const baseURL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.PROD ? productionGatewayUrl : localGatewayUrl
)

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
