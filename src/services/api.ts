import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import axiosInstance from '@/libs/axios'

// Types
export interface User {
  id: number
  role_id: number
  name: string
  email: string
  phone_number: string
  profile_picture_url: string
  status: string
  created_at: string
  updated_at: string
  role: {
    id: number
    name: string
  }
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  name?: string
  email?: string
  role_id?: number
  status?: string
}

interface UserResponse {
  statusCode: number
  message: string
  data: User
}

interface UsersResponse {
  statusCode: number
  message: string
  data: {
    data: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface CreateUserData {
  name: string
  email: string
}

interface Role {
  id: number
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

interface RolesResponse {
  data: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API endpoints
const API_ENDPOINTS = {
  USERS: '/users',
  USER: (id: number) => `/users/${id}`,
  ROLES: '/roles'
}

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: number) => ['user', id] as const,
  roles: ['roles'] as const
}

// API functions
export const userApi = {
  // Get all users
  getUsers: async (token: string, params?: UsersQueryParams): Promise<UsersResponse> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return data
  },

  // Get single user
  getUser: async (id: number, token: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USER(id), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return data
  },

  // Create user
  createUser: async (userData: CreateUserData, token: string): Promise<User> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.USERS, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return data
  },

  // Update user
  updateUser: async (id: number, userData: Partial<CreateUserData>, token: string): Promise<User> => {
    const { data } = await axiosInstance.patch(API_ENDPOINTS.USER(id), userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return data
  },

  // Delete user
  deleteUser: async (id: number, token: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.USER(id), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  // Get all roles
  getRoles: async (token: string): Promise<RolesResponse> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.ROLES}?page=1&limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return data
  }
}

// React Query hooks
export const useUsers = (params?: UsersQueryParams): UseQueryResult<UsersResponse, Error> => {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => userApi.getUsers(session?.access_token || '', params),
    enabled: !!session?.access_token
  })
}

export const useUser = (id: number): UseQueryResult<UserResponse, Error> => {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.getUser(id, session?.access_token || ''),
    enabled: !!id && !!session?.access_token
  })
}

export const useCreateUser = (): UseMutationResult<User, Error, CreateUserData> => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: (userData: CreateUserData) => userApi.createUser(userData, session?.access_token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    }
  })
}

export const useUpdateUser = (): UseMutationResult<User, Error, { id: number; data: Partial<CreateUserData> }> => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserData> }) =>
      userApi.updateUser(id, data, session?.access_token || ''),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
    }
  })
}

export const useDeleteUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id, session?.access_token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    }
  })
}

export const useRoles = (): UseQueryResult<RolesResponse, Error> => {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => userApi.getRoles(session?.access_token || ''),
    enabled: !!session?.access_token
  })
}
