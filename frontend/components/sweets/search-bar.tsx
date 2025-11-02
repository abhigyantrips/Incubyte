'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SearchBarProps {
  onSearch: (filters: { name?: string; category?: string }) => void
}

const CATEGORIES = [
  'All Categories',
  'Chocolate',
  'Candy',
  'Gummies',
  'Lollipops',
  'Hard Candy',
  'Caramel',
]

export function SearchBar({ onSearch }: SearchBarProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('All Categories')

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: { name?: string; category?: string } = {}
      
      if (name.trim()) {
        filters.name = name.trim()
      }
      
      if (category !== 'All Categories') {
        filters.category = category
      }
      
      onSearch(filters)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [name, category, onSearch])

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search-name">Search by Name</Label>
          <Input
            id="search-name"
            type="text"
            placeholder="Enter sweet name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="search-category">Filter by Category</Label>
          <select
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
