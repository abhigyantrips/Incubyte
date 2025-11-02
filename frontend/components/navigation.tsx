'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, logout, User } from '@/lib/api'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
  }

  // Don't render navigation on auth pages
  if (!mounted || pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Sweet Shop
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === '/admin'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
