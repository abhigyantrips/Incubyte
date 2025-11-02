'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Sweet Shop
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Browse our delicious collection of sweets and treats. 
          Sign in to start shopping or register for a new account.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
