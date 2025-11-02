import request from 'supertest'

import app from '../src/index'
import { query } from '../src/lib/db'

describe('Authentication', () => {
  beforeEach(async () => {
    // Clean up users table before each test
    await query('DELETE FROM users')
  })

  afterAll(async () => {
    // Clean up after all tests
    await query('DELETE FROM users')
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials and return 201', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email', 'test@example.com')
      expect(response.body).toHaveProperty('role')
      expect(response.body).not.toHaveProperty('password')
    })

    it('should reject duplicate email registration with 400 status', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
      })

      // Attempt duplicate registration
      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password456',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before login tests
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
      })
    })

    it('should login with valid credentials and return 200 with JWT token', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('email', 'login@example.com')
      expect(response.body.user).toHaveProperty('role')
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should reject login with invalid credentials and return 401', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })
})
