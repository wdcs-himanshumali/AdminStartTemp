import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Extend the InternalAxiosRequestConfig type to include _retry
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth token here
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
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
