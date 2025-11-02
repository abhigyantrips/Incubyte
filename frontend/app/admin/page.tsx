'use client'

import { useState } from 'react'
import { AdminForm } from '@/components/sweets/admin-form'
import { SweetList } from '@/components/sweets/sweet-list'
import { ProtectedRoute } from '@/components/protected-route'

export default function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    // Refresh the sweet list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <AdminForm onSuccess={handleSuccess} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Inventory Management</h2>
            <SweetList key={refreshKey} isAdmin={true} onRestock={handleSuccess} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
