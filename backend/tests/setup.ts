import pool from '../src/lib/db'

// Jest setup file for global test configuration
// Add any global test setup here

beforeAll(() => {
  // Setup before all tests
})

afterAll(async () => {
  // Cleanup after all tests - close database connection
  await pool.end()
})
