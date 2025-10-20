'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkOnboarding() {
      // Skip check if not authenticated yet
      if (status !== 'authenticated') {
        setIsChecking(false)
        return
      }

      // Skip check if already on onboarding page
      if (pathname === '/onboarding') {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch('/api/onboarding')
        const data = await response.json()

        if (data.needsOnboarding && data.authenticated) {
          // User needs onboarding, redirect to onboarding page
          router.push('/onboarding')
        } else {
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [status, pathname, router])

  // Show loading state while checking
  if (isChecking && status === 'authenticated' && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl p-8">
          <div className="animate-pulse text-center">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
