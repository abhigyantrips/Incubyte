'use client'

import { useState } from 'react'
import { SweetList } from '@/components/sweets/sweet-list'
import { SearchBar } from '@/components/sweets/search-bar'
import { ProtectedRoute } from '@/components/protected-route'

export default function DashboardPage() {
  const [filters, setFilters] = useState<{
    name?: string
    category?: string
  }>({})

  const handleSearch = (newFilters: { name?: string; category?: string }) => {
    setFilters(newFilters)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Sweet Shop</h1>
        <SearchBar onSearch={handleSearch} />
        <SweetList filters={filters} />
      </div>
    </ProtectedRoute>
  )
}
