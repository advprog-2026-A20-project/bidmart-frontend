import client from './client.js'

export const getListings = async ({ status } = {}) => {
  const response = await client.get('/listings', {
    params: status ? { status } : undefined,
  })
  return response.data
}

export const createListing = async ({ title, description, price }) => {
  const response = await client.post('/listings', {
    title,
    description,
    price,
  })
  return response.data
}
