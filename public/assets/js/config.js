const productionGatewayUrl =
  'https://identical-daffy-backendtugasadprokelompoka20-0d961edc.koyeb.app/api'

const isLocalHost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

window.__API_URL__ = window.__API_URL__ || (
  isLocalHost ? 'http://localhost:8080/api' : productionGatewayUrl
)
