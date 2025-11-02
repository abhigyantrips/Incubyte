import express, { Application } from 'express'

import dotenv from 'dotenv'

import pool from './lib/db'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import sweetsRoutes from './routes/sweets.routes'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3000

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3001', 'http://localhost:3000']

  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  )
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  next()
})

// Normalize Content-Type charset for Express 5.x compatibility
app.use((req, res, next) => {
  const contentType = req.headers['content-type']
  if (contentType && contentType.includes('charset=UTF-8')) {
    req.headers['content-type'] = contentType.replace('charset=UTF-8', 'charset=utf-8')
  }
  next()
})

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/sweets', sweetsRoutes)

// 404 handler for undefined routes
app.use(notFoundHandler)

// Global error handling middleware (must be last)
app.use(errorHandler)

// Database connection check and server startup
const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect()
    console.log('✓ Database connection established')
    client.release()

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('✗ Failed to start server:', error)
    console.error('✗ Database connection failed. Please check your configuration.')
    process.exit(1)
  }
}

// Start server only if this file is run directly
if (require.main === module) {
  startServer()
}

export default app
