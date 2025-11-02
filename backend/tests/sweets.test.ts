import request from 'supertest'

import app from '../src/index'
import { query } from '../src/lib/db'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

describe('Sweet CRUD Operations', () => {
  let userToken: string
  let adminToken: string
  let testSweetId: string

  beforeAll(async () => {
    // Clean up tables
    await query('DELETE FROM sweets')
    await query('DELETE FROM users')

    // Create a regular user
    const userResponse = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
    })

    // Login to get user token
    const userLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })
    userToken = userLoginResponse.body.token

    // Create an admin user directly in database
    await query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)`,
      ['admin@example.com', '$2b$10$dummyhashedpassword', 'admin']
    )

    // For admin, we need to register and then update role
    const adminRegResponse = await request(app).post('/api/auth/register').send({
      email: 'admin2@example.com',
      password: 'adminpass123',
    })

    // Update the user to admin role
    await query(`UPDATE users SET role = 'admin' WHERE email = $1`, [
      'admin2@example.com',
    ])

    // Login as admin to get token
    const adminLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin2@example.com',
      password: 'adminpass123',
    })
    adminToken = adminLoginResponse.body.token
  })

  afterAll(async () => {
    // Clean up after all tests
    await query('DELETE FROM sweets')
    await query('DELETE FROM users')
  })

  beforeEach(async () => {
    // Clean sweets before each test
    await query('DELETE FROM sweets')
  })

  describe('GET /api/sweets', () => {
    it('should return array of all sweets', async () => {
      // Insert test sweets
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Chocolate Bar', 'chocolate', 2.99, 10]
      )
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Gummy Bears', 'candy', 1.99, 20]
      )

      const response = await request(app).get('/api/sweets')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('category')
      expect(response.body[0]).toHaveProperty('price')
      expect(response.body[0]).toHaveProperty('quantity')
    })
  })

  describe('POST /api/sweets', () => {
    it('should return 401 when creating sweet without token', async () => {
      const response = await request(app).post('/api/sweets').send({
        name: 'Lollipop',
        category: 'candy',
        price: 0.99,
        quantity: 50,
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should create sweet with valid token and return 201', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Lollipop',
          category: 'candy',
          price: 0.99,
          quantity: 50,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'Lollipop')
      expect(response.body).toHaveProperty('category', 'candy')
      expect(response.body.price).toBe('0.99')
      expect(response.body).toHaveProperty('quantity', 50)

      // Store the ID for other tests
      testSweetId = response.body.id
    })
  })

  describe('PUT /api/sweets/:id', () => {
    beforeEach(async () => {
      // Create a sweet for update tests
      const result = await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Original Sweet', 'chocolate', 3.99, 15]
      )
      testSweetId = result.rows[0].id
    })

    it('should update sweet and return 200', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Sweet',
          price: 4.99,
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', testSweetId)
      expect(response.body).toHaveProperty('name', 'Updated Sweet')
      expect(response.body.price).toBe('4.99')
      expect(response.body).toHaveProperty('category', 'chocolate') // Should remain unchanged
    })
  })

  describe('DELETE /api/sweets/:id', () => {
    beforeEach(async () => {
      // Create a sweet for delete tests
      const result = await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Sweet to Delete', 'candy', 2.49, 25]
      )
      testSweetId = result.rows[0].id
    })

    it('should return 403 when non-admin tries to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })

    it('should delete sweet and return 200 when admin deletes', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')

      // Verify sweet is deleted
      const checkResponse = await request(app).get('/api/sweets')
      expect(checkResponse.body.length).toBe(0)
    })
  })

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Insert test sweets for search tests
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Chocolate Bar', 'chocolate', 2.99, 10]
      )
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Dark Chocolate', 'chocolate', 3.99, 5]
      )
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Gummy Bears', 'candy', 1.99, 20]
      )
      await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)`,
        ['Lollipop', 'candy', 0.99, 50]
      )
    })

    it('should filter sweets by name', async () => {
      const response = await request(app).get(
        '/api/sweets/search?name=chocolate'
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      expect(response.body[0].name).toContain('Chocolate')
      expect(response.body[1].name).toContain('Chocolate')
    })

    it('should filter sweets by category', async () => {
      const response = await request(app).get(
        '/api/sweets/search?category=candy'
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      expect(response.body[0].category).toBe('candy')
      expect(response.body[1].category).toBe('candy')
    })

    it('should perform case-insensitive name search', async () => {
      const response = await request(app).get(
        '/api/sweets/search?name=CHOCOLATE'
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      expect(response.body[0].name).toContain('Chocolate')
      expect(response.body[1].name).toContain('Chocolate')
    })
  })

  describe('POST /api/sweets/:id/purchase', () => {
    beforeEach(async () => {
      // Create a sweet for purchase tests
      const result = await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Sweet to Purchase', 'candy', 1.99, 5]
      )
      testSweetId = result.rows[0].id
    })

    it('should decrease quantity by 1 when purchasing sweet', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', testSweetId)
      expect(response.body).toHaveProperty('quantity', 4)
    })

    it('should return 400 when purchasing sweet with zero quantity', async () => {
      // Update sweet to have zero quantity
      await query(`UPDATE sweets SET quantity = 0 WHERE id = $1`, [testSweetId])

      const response = await request(app)
        .post(`/api/sweets/${testSweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 when purchasing without authentication', async () => {
      const response = await request(app).post(
        `/api/sweets/${testSweetId}/purchase`
      )

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/sweets/:id/restock', () => {
    beforeEach(async () => {
      // Create a sweet for restock tests
      const result = await query(
        `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Sweet to Restock', 'chocolate', 2.99, 10]
      )
      testSweetId = result.rows[0].id
    })

    it('should return 403 when non-admin tries to restock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 20 })

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })

    it('should increase quantity when admin restocks', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', testSweetId)
      expect(response.body).toHaveProperty('quantity', 30)
    })
  })
})
