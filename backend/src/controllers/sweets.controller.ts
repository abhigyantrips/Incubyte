import { Request, Response } from 'express'

import { query } from '../lib/db'
import { CreateSweetRequest, Sweet } from '../types'

export const getAllSweets = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM sweets ORDER BY created_at DESC')

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching sweets:', error)
    res.status(500).json({ error: 'Failed to fetch sweets' })
  }
}

export const createSweet = async (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity }: CreateSweetRequest = req.body

    // Validate required fields
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await query(
      `INSERT INTO sweets (name, category, price, quantity) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, category, price, quantity]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating sweet:', error)
    res.status(500).json({ error: 'Failed to create sweet' })
  }
}

export const updateSweet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Build dynamic update query
    const fields = Object.keys(updates)
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ')
    const values = [id, ...fields.map((field) => updates[field])]

    const result = await query(
      `UPDATE sweets 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating sweet:', error)
    res.status(500).json({ error: 'Failed to update sweet' })
  }
}

export const deleteSweet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await query('DELETE FROM sweets WHERE id = $1 RETURNING id', [
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' })
    }

    res.json({ message: 'Sweet deleted successfully' })
  } catch (error) {
    console.error('Error deleting sweet:', error)
    res.status(500).json({ error: 'Failed to delete sweet' })
  }
}

export const searchSweets = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.query

    let queryText = 'SELECT * FROM sweets WHERE 1=1'
    const queryParams: any[] = []
    let paramIndex = 1

    // Add name filter with case-insensitive matching
    if (name && typeof name === 'string') {
      queryText += ` AND name ILIKE $${paramIndex}`
      queryParams.push(`%${name}%`)
      paramIndex++
    }

    // Add category filter
    if (category && typeof category === 'string') {
      queryText += ` AND category = $${paramIndex}`
      queryParams.push(category)
      paramIndex++
    }

    queryText += ' ORDER BY created_at DESC'

    const result = await query(queryText, queryParams)

    res.json(result.rows)
  } catch (error) {
    console.error('Error searching sweets:', error)
    res.status(500).json({ error: 'Failed to search sweets' })
  }
}

export const purchaseSweet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // First, check current quantity
    const checkResult = await query('SELECT quantity FROM sweets WHERE id = $1', [
      id,
    ])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' })
    }

    const currentQuantity = checkResult.rows[0].quantity

    // Check if out of stock
    if (currentQuantity <= 0) {
      return res.status(400).json({ error: 'Sweet is out of stock' })
    }

    // Decrement quantity by 1
    const result = await query(
      `UPDATE sweets 
       SET quantity = quantity - 1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error purchasing sweet:', error)
    res.status(500).json({ error: 'Failed to purchase sweet' })
  }
}

export const restockSweet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    // Validate quantity is provided and is a positive integer
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res
        .status(400)
        .json({ error: 'Quantity must be a positive integer' })
    }

    // Check if sweet exists
    const checkResult = await query('SELECT id FROM sweets WHERE id = $1', [id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' })
    }

    // Increase quantity by specified amount
    const result = await query(
      `UPDATE sweets 
       SET quantity = quantity + $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, quantity]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error restocking sweet:', error)
    res.status(500).json({ error: 'Failed to restock sweet' })
  }
}
