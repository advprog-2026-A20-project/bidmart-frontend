const configuredGatewayUrl = window.__BIDMART_API_URL__ || ''
const productionGatewayUrl = configuredGatewayUrl || 'https://bidmart-gateway-a20-b69debb40c3a.herokuapp.com/api'

const isLocalHost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

window.__API_URL__ = window.__API_URL__ || (
  isLocalHost ? 'http://localhost:8080/api' : productionGatewayUrl
)
