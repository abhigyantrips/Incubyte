import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { query } from '../lib/db'
import { AuthRequest, AuthResponse, JWTPayload, UserResponse } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SALT_ROUNDS = 10

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: AuthRequest = req.body

    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email already registered' })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Insert new user
    const result = await query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'user'],
    )

    const user: UserResponse = result.rows[0]
    res.status(201).json(user)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: AuthRequest = req.body

    // Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const authResponse: AuthResponse = {
      token,
      user: userResponse,
    }

    res.status(200).json(authResponse)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
