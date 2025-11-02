import axios, { AxiosInstance } from 'axios'

// Types matching backend API
export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Sweet {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}

export interface CreateSweetRequest {
  name: string
  category: string
  price: number
  quantity: number
}

export interface RestockRequest {
  quantity: number
}

export interface AuthRequest {
  email: string
  password: string
}

// Token storage utilities
const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },

  remove: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },
}

// Decode JWT token to get user info
export const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    }
  } catch {
    return null
  }
}

// Get current user from token
export const getCurrentUser = (): User | null => {
  const token = tokenStorage.get()
  if (!token) return null
  return decodeToken(token)
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return tokenStorage.get() !== null
}

// Logout utility
export const logout = (): void => {
  tokenStorage.remove()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Create Axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      tokenStorage.remove()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Authentication API calls
export const authApi = {
  register: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      credentials
    )
    return response.data
  },

  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials
    )
    return response.data
  },
}

// Sweet API calls
export const sweetApi = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await apiClient.get<Sweet[]>('/api/sweets')
    return response.data
  },

  search: async (params: {
    name?: string
    category?: string
  }): Promise<Sweet[]> => {
    const response = await apiClient.get<Sweet[]>('/api/sweets/search', {
      params,
    })
    return response.data
  },

  create: async (sweet: CreateSweetRequest): Promise<Sweet> => {
    const response = await apiClient.post<Sweet>('/api/sweets', sweet)
    return response.data
  },

  update: async (id: string, sweet: Partial<Sweet>): Promise<Sweet> => {
    const response = await apiClient.put<Sweet>(`/api/sweets/${id}`, sweet)
    return response.data
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/sweets/${id}`
    )
    return response.data
  },

  purchase: async (id: string): Promise<Sweet> => {
    const response = await apiClient.post<Sweet>(`/api/sweets/${id}/purchase`)
    return response.data
  },

  restock: async (id: string, quantity: number): Promise<Sweet> => {
    const response = await apiClient.post<Sweet>(`/api/sweets/${id}/restock`, {
      quantity,
    })
    return response.data
  },
}

export default apiClient
