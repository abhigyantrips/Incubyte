import request from 'supertest'

import app from '../src/index'
import { query } from '../src/lib/db'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { afterEach } from 'node:test'
import { describe } from 'node:test'

describe('End-to-End Integration Tests', () => {
  let regularUserToken: string
  let adminUserToken: string
  let regularUserId: string
  let adminUserId: string
  let sweetId1: string
  let sweetId2: string
  let sweetId3: string

  beforeAll(async () => {
    // Clean up tables before starting
    await query('DELETE FROM sweets')
    await query('DELETE FROM users')
  })

  afterAll(async () => {
    // Clean up after all tests
    await query('DELETE FROM sweets')
    await query('DELETE FROM users')
  })

  // Add cleanup between test suites to ensure isolation
  afterEach(async () => {
    // Only clean up sweets created during specific test suites
    // Keep the main test users and sweets for dependent tests
  })

  describe('Complete User Registration and Login Flow', () => {
    it('should register a new regular user successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'customer@sweetshop.com',
        password: 'SecurePass123',
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email', 'customer@sweetshop.com')
      expect(response.body).toHaveProperty('role', 'user')
      expect(response.body).not.toHaveProperty('password')

      regularUserId = response.body.id
    })

    it('should login with the registered user credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'customer@sweetshop.com',
        password: 'SecurePass123',
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('id', regularUserId)
      expect(response.body.user).toHaveProperty('email', 'customer@sweetshop.com')
      expect(response.body.user).toHaveProperty('role', 'user')

      regularUserToken = response.body.token
    })

    it('should register an admin user successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'admin@sweetshop.com',
        password: 'AdminPass456',
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      adminUserId = response.body.id

      // Update user to admin role
      await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [adminUserId])
    })

    it('should login with admin credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@sweetshop.com',
        password: 'AdminPass456',
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).toHaveProperty('role', 'admin')

      adminUserToken = response.body.token
    })

    it('should reject duplicate email registration', async () => {
      // Try to register with the same email as the first test
      const response = await request(app).post('/api/auth/register').send({
        email: 'customer@sweetshop.com', // This email was already registered in the first test
        password: 'AnotherPassword',
      })

      // Should fail because email already exists
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should reject login with invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'customer@sweetshop.com',
        password: 'WrongPassword',
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Admin Sweet Creation, Update, and Deletion Flow', () => {
    it('should allow admin to create a new sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Milk Chocolate Bar',
          category: 'chocolate',
          price: 2.99,
          quantity: 50,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'Milk Chocolate Bar')
      expect(response.body).toHaveProperty('category', 'chocolate')
      expect(response.body.price).toBe('2.99')
      expect(response.body).toHaveProperty('quantity', 50)

      sweetId1 = response.body.id
    })

    it('should allow admin to create multiple sweets', async () => {
      const response1 = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Gummy Bears',
          category: 'candy',
          price: 1.99,
          quantity: 100,
        })

      expect(response1.status).toBe(201)
      sweetId2 = response1.body.id

      const response2 = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Lollipop',
          category: 'candy',
          price: 0.99,
          quantity: 0, // Out of stock
        })

      expect(response2.status).toBe(201)
      sweetId3 = response2.body.id
    })

    it('should allow admin to update a sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId1}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Premium Milk Chocolate Bar',
          price: 3.49,
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('name', 'Premium Milk Chocolate Bar')
      expect(response.body.price).toBe('3.49')
      expect(response.body).toHaveProperty('category', 'chocolate') // Unchanged
    })

    it('should prevent non-admin from deleting a sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId3}`)
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })

    it('should allow admin to delete a sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId3}`)
        .set('Authorization', `Bearer ${adminUserToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')

      // Verify sweet is deleted
      const allSweets = await request(app).get('/api/sweets')
      const deletedSweet = allSweets.body.find((s: any) => s.id === sweetId3)
      expect(deletedSweet).toBeUndefined()
    })

    it('should prevent unauthenticated users from creating sweets', async () => {
      const response = await request(app).post('/api/sweets').send({
        name: 'Unauthorized Sweet',
        category: 'candy',
        price: 1.99,
        quantity: 10,
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Sweet Browsing and Purchase Flow as Authenticated User', () => {
    it('should allow anyone to browse all sweets', async () => {
      const response = await request(app).get('/api/sweets')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2) // At least two sweets remaining after deletion
      
      const sweet1 = response.body.find((s: any) => s.id === sweetId1)
      expect(sweet1).toBeDefined()
      expect(sweet1).toHaveProperty('name', 'Premium Milk Chocolate Bar')
      expect(sweet1.price).toBe('3.49')
      expect(sweet1).toHaveProperty('quantity', 50)

      const sweet2 = response.body.find((s: any) => s.id === sweetId2)
      expect(sweet2).toBeDefined()
      expect(sweet2).toHaveProperty('name', 'Gummy Bears')
      expect(sweet2).toHaveProperty('quantity', 100)
    })

    it('should allow authenticated user to purchase a sweet', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/purchase`)
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', sweetId1)
      expect(response.body).toHaveProperty('quantity', 49) // Decreased by 1
    })

    it('should allow multiple purchases', async () => {
      // Purchase again
      const response1 = await request(app)
        .post(`/api/sweets/${sweetId1}/purchase`)
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response1.status).toBe(200)
      expect(response1.body).toHaveProperty('quantity', 48)

      // Purchase from different sweet
      const response2 = await request(app)
        .post(`/api/sweets/${sweetId2}/purchase`)
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response2.status).toBe(200)
      expect(response2.body).toHaveProperty('quantity', 99)
    })

    it('should prevent unauthenticated users from purchasing', async () => {
      const response = await request(app).post(`/api/sweets/${sweetId1}/purchase`)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should prevent purchase when sweet is out of stock', async () => {
      // Create a sweet with zero quantity
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Out of Stock Sweet',
          category: 'candy',
          price: 1.49,
          quantity: 0,
        })

      const outOfStockId = createResponse.body.id

      const response = await request(app)
        .post(`/api/sweets/${outOfStockId}/purchase`)
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Inventory Restock Flow as Admin', () => {
    it('should allow admin to restock a sweet', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/restock`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: 25 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id', sweetId1)
      expect(response.body).toHaveProperty('quantity', 73) // 48 + 25
    })

    it('should allow admin to restock multiple times', async () => {
      const response1 = await request(app)
        .post(`/api/sweets/${sweetId2}/restock`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: 50 })

      expect(response1.status).toBe(200)
      expect(response1.body).toHaveProperty('quantity', 149) // 99 + 50

      const response2 = await request(app)
        .post(`/api/sweets/${sweetId2}/restock`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: 1 })

      expect(response2.status).toBe(200)
      expect(response2.body).toHaveProperty('quantity', 150) // 149 + 1
    })

    it('should prevent non-admin from restocking', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/restock`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ quantity: 10 })

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })

    it('should prevent unauthenticated users from restocking', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/restock`)
        .send({ quantity: 10 })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Search and Filter Functionality', () => {
    beforeAll(async () => {
      // Add more sweets for comprehensive search testing
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Dark Chocolate Truffle',
          category: 'chocolate',
          price: 4.99,
          quantity: 30,
        })

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Sour Gummy Worms',
          category: 'candy',
          price: 2.49,
          quantity: 75,
        })
    })

    it('should filter sweets by name (case-insensitive)', async () => {
      const response = await request(app).get('/api/sweets/search?name=chocolate')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      
      response.body.forEach((sweet: any) => {
        expect(sweet.name.toLowerCase()).toContain('chocolate')
      })
    })

    it('should filter sweets by name with uppercase query', async () => {
      const response = await request(app).get('/api/sweets/search?name=GUMMY')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      
      response.body.forEach((sweet: any) => {
        expect(sweet.name.toLowerCase()).toContain('gummy')
      })
    })

    it('should filter sweets by category', async () => {
      const response = await request(app).get('/api/sweets/search?category=candy')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      
      response.body.forEach((sweet: any) => {
        expect(sweet.category).toBe('candy')
      })
    })

    it('should filter sweets by chocolate category', async () => {
      const response = await request(app).get('/api/sweets/search?category=chocolate')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
      
      response.body.forEach((sweet: any) => {
        expect(sweet.category).toBe('chocolate')
      })
    })

    it('should return empty array for non-matching search', async () => {
      const response = await request(app).get('/api/sweets/search?name=NonExistentSweet')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(0)
    })

    it('should combine name and category filters', async () => {
      const response = await request(app).get('/api/sweets/search?name=gummy&category=candy')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      
      response.body.forEach((sweet: any) => {
        expect(sweet.name.toLowerCase()).toContain('gummy')
        expect(sweet.category).toBe('candy')
      })
    })
  })

  describe('Error Handling for Edge Cases', () => {
    it('should handle invalid sweet ID for purchase', async () => {
      const response = await request(app)
        .post('/api/sweets/invalid-uuid/purchase')
        .set('Authorization', `Bearer ${regularUserToken}`)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle invalid sweet ID for restock', async () => {
      const response = await request(app)
        .post('/api/sweets/invalid-uuid/restock')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: 10 })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle invalid sweet ID for update', async () => {
      const response = await request(app)
        .put('/api/sweets/invalid-uuid')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ name: 'Updated Name' })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle invalid sweet ID for delete', async () => {
      const response = await request(app)
        .delete('/api/sweets/invalid-uuid')
        .set('Authorization', `Bearer ${adminUserToken}`)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle missing authorization header', async () => {
      const response = await request(app).post('/api/sweets').send({
        name: 'Test Sweet',
        category: 'candy',
        price: 1.99,
        quantity: 10,
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({
          name: 'Test Sweet',
          category: 'candy',
          price: 1.99,
          quantity: 10,
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle malformed request body for registration', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        // Missing password
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle malformed request body for sweet creation', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          name: 'Test Sweet',
          // Missing required fields
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle negative restock quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/restock`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: -10 })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle zero restock quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId1}/restock`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ quantity: 0 })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Complete Workflow Integration', () => {
    it('should complete a full user journey from registration to purchase', async () => {
      // 1. Register new user
      const registerResponse = await request(app).post('/api/auth/register').send({
        email: 'journey@sweetshop.com',
        password: 'JourneyPass789',
      })
      expect(registerResponse.status).toBe(201)

      // 2. Login
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'journey@sweetshop.com',
        password: 'JourneyPass789',
      })
      expect(loginResponse.status).toBe(200)
      const journeyToken = loginResponse.body.token

      // 3. Browse sweets
      const browseResponse = await request(app).get('/api/sweets')
      expect(browseResponse.status).toBe(200)
      expect(browseResponse.body.length).toBeGreaterThan(0)

      // 4. Search for specific sweet
      const searchResponse = await request(app).get('/api/sweets/search?name=chocolate')
      expect(searchResponse.status).toBe(200)
      const chocolateSweet = searchResponse.body[0]

      // 5. Purchase the sweet
      const purchaseResponse = await request(app)
        .post(`/api/sweets/${chocolateSweet.id}/purchase`)
        .set('Authorization', `Bearer ${journeyToken}`)
      expect(purchaseResponse.status).toBe(200)
      expect(purchaseResponse.body.quantity).toBe(chocolateSweet.quantity - 1)
    })

    it('should complete a full admin journey from login to inventory management', async () => {
      // 1. Use the existing admin token from earlier tests
      const token = adminUserToken

      // 2. Create new sweet
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Admin Special Candy',
          category: 'candy',
          price: 3.99,
          quantity: 20,
        })
      expect(createResponse.status).toBe(201)
      const newSweetId = createResponse.body.id

      // 3. Update the sweet
      const updateResponse = await request(app)
        .put(`/api/sweets/${newSweetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 4.49 })
      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.price).toBe('4.49')

      // 4. Restock the sweet
      const restockResponse = await request(app)
        .post(`/api/sweets/${newSweetId}/restock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 30 })
      expect(restockResponse.status).toBe(200)
      expect(restockResponse.body.quantity).toBe(50)

      // 5. Delete the sweet
      const deleteResponse = await request(app)
        .delete(`/api/sweets/${newSweetId}`)
        .set('Authorization', `Bearer ${token}`)
      expect(deleteResponse.status).toBe(200)

      // 6. Verify deletion
      const verifyResponse = await request(app).get('/api/sweets')
      const deletedSweet = verifyResponse.body.find((s: any) => s.id === newSweetId)
      expect(deletedSweet).toBeUndefined()
    })
  })
})
