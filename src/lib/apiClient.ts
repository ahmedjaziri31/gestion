import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = 'http://localhost:5000/api/'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Attach token from cookies if available
apiClient.interceptors.request.use((config) => {
  const tokenCookie = Cookies.get('thisisjustarandomstring')
  if (tokenCookie) {
    try {
      const token = JSON.parse(tokenCookie)
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Error parsing auth token from cookie', error)
    }
  }
  return config
})

export default apiClient
