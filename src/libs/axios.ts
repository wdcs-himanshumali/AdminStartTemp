import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

console.log('Creating axios instance with baseURL:', 'http://localhost:3000/api')

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'app-type': 'web',
    'Accept-Language': 'en'
  }
})

// Extend the InternalAxiosRequestConfig type to include _retry
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Axios Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    })

    // You can add auth token here
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Axios Request Error:', error)

    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Axios Response:', {
      status: response.status,
      data: response.data
    })

    return response
  },
  async (error: AxiosError) => {
    console.error('Axios Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    const originalRequest = error.config as CustomInternalAxiosRequestConfig

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Implement refresh token logic here
        // const refreshToken = localStorage.getItem('refreshToken')
        // const response = await axios.post('/auth/refresh', { refreshToken })
        // const { accessToken } = response.data
        // localStorage.setItem('accessToken', accessToken)
        // originalRequest.headers.Authorization = `Bearer ${accessToken}`
        // return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Handle refresh token failure
        // localStorage.removeItem('accessToken')
        // localStorage.removeItem('refreshToken')
        // window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
