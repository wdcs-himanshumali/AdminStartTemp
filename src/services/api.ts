import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import axiosInstance from '@/libs/axios'

// Types
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserData {
  name: string
  email: string
}

// API endpoints
const API_ENDPOINTS = {
  USERS: '/users',
  USER: (id: number) => `/users/${id}`
}

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: number) => ['user', id] as const
}

// API functions
export const userApi = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS)

    return data
  },

  // Get single user
  getUser: async (id: number): Promise<User> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USER(id))

    return data
  },

  // Create user
  createUser: async (userData: CreateUserData): Promise<User> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.USERS, userData)

    return data
  },

  // Update user
  updateUser: async (id: number, userData: Partial<CreateUserData>): Promise<User> => {
    const { data } = await axiosInstance.put(API_ENDPOINTS.USER(id), userData)

    return data
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.USER(id))
  }
}

// React Query hooks
export const useUsers = (): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: userApi.getUsers
  })
}

export const useUser = (id: number): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id
  })
}

export const useCreateUser = (): UseMutationResult<User, Error, CreateUserData> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    }
  })
}

export const useUpdateUser = (): UseMutationResult<User, Error, { id: number; data: Partial<CreateUserData> }> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserData> }) => userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
    }
  })
}

export const useDeleteUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    }
  })
}
