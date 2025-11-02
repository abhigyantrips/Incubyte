import { Router } from 'express'

import {
  createSweet,
  deleteSweet,
  getAllSweets,
  purchaseSweet,
  restockSweet,
  searchSweets,
  updateSweet,
} from '../controllers/sweets.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// Public routes
router.get('/', getAllSweets)
router.get('/search', searchSweets)

// Protected routes (authentication required)
router.post('/', authenticate, createSweet)
router.put('/:id', authenticate, updateSweet)
router.post('/:id/purchase', authenticate, purchaseSweet)

// Admin-only routes
router.delete('/:id', authenticate, requireAdmin, deleteSweet)
router.post('/:id/restock', authenticate, requireAdmin, restockSweet)

export default router
