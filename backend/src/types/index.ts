// User types
export interface User {
  id: string
  email: string
  password: string
  role: 'user' | 'admin'
  created_at: Date
}

export interface UserResponse {
  id: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserResponse
}

// Sweet types
export interface Sweet {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  created_at: Date
  updated_at: Date
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

// JWT Payload
export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}
