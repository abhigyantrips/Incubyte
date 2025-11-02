'use client'

import { useEffect, useState } from 'react'
import { Sweet, sweetApi } from '@/lib/api'
import { SweetCard } from './sweet-card'

interface SweetListProps {
  filters?: {
    name?: string
    category?: string
  }
  isAdmin?: boolean
  onRestock?: () => void
}

export function SweetList({
  filters,
  isAdmin = false,
  onRestock,
}: SweetListProps) {
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSweets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let data: Sweet[]
      
      // Use search API if filters are provided, otherwise get all
      if (filters && (filters.name || filters.category)) {
        data = await sweetApi.search(filters)
      } else {
        data = await sweetApi.getAll()
      }
      
      setSweets(data)
    } catch (err) {
      setError('Failed to load sweets')
      console.error('Error fetching sweets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSweets()
  }, [filters])

  const handlePurchase = () => {
    // Refresh the list after purchase
    fetchSweets()
  }

  const handleRestock = () => {
    // Refresh the list after restock
    fetchSweets()
    onRestock?.()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (sweets.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No sweets available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sweets.map((sweet) => (
        <SweetCard
          key={sweet.id}
          sweet={sweet}
          onPurchase={handlePurchase}
          isAdmin={isAdmin}
          onRestock={handleRestock}
        />
      ))}
    </div>
  )
}
