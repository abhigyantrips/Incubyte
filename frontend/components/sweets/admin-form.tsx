'use client'

import { useState } from 'react'
import { sweetApi, CreateSweetRequest } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AdminFormProps {
  onSuccess?: () => void
}

export function AdminForm({ onSuccess }: AdminFormProps) {
  const [formData, setFormData] = useState<CreateSweetRequest>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be a positive number'
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await sweetApi.create(formData)
      // Reset form
      setFormData({
        name: '',
        category: '',
        price: 0,
        quantity: 0,
      })
      setErrors({})
      onSuccess?.()
    } catch (error: any) {
      setErrors({
        submit:
          error.response?.data?.message || 'Failed to create sweet',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateSweetRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sweet</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter sweet name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Enter category"
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Sweet'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
