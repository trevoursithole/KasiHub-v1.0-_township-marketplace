import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kasihub_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('kasihub_token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const authAPI = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  me: () => api.get('/auth/me'),
  update: (d) => api.patch('/auth/me', d),
}

export const listingsAPI = {
  getAll: (p) => api.get('/listings', { params: p }),
  getOne: (id) => api.get(`/listings/${id}`),
  create: (d) => api.post('/listings', d),
  update: (id, d) => api.patch(`/listings/${id}`, d),
  delete: (id) => api.delete(`/listings/${id}`),
}

export const runnersAPI = {
  getAll: (p) => api.get('/runners', { params: p }),
  register: (d) => api.post('/runners/register', d),
  setStatus: (d) => api.patch('/runners/status', d),
}

export const zonesAPI = {
  getAll: (p) => api.get('/zones', { params: p }),
}

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (d) => api.post('/transactions', d),
  complete: (id) => api.post(`/transactions/${id}/complete`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  readAll: () => api.patch('/notifications/read-all'),
}

export const statsAPI = {
  platform: () => api.get('/stats/platform'),
}

export const reviewsAPI = {
  create: (d) => api.post('/reviews', d),
}

export default api
