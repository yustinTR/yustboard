'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationSlug: ''
  })

  // Check if user is already part of an organization
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/onboarding')
          const data = await response.json()

          if (!data.needsOnboarding && data.organization) {
            // User already has an organization, redirect to dashboard
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error)
        }
      }
    }

    checkOnboardingStatus()
  }, [status, router])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/onboarding')
    }
  }, [status, router])

  // Auto-generate slug from organization name
  const handleNameChange = (name: string) => {
    setFormData({
      organizationName: name,
      organizationSlug: name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    })
    setError(null)
  }

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')

    setFormData({
      ...formData,
      organizationSlug: cleanSlug
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to YustBoard! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Let&apos;s set up your organization to get started
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-sm text-white border-b border-white/20 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold">Create Your Organization</h2>
            <p className="text-indigo-100 mt-1">
              Step {step} of 2: {step === 1 ? 'Basic Information' : 'Confirmation'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-6">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600/30 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., Acme Inc., My Team"
                    required
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This will be displayed throughout your dashboard
                  </p>
                </div>

                <div>
                  <label htmlFor="organizationSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      yustboard.com/
                    </span>
                    <input
                      type="text"
                      id="organizationSlug"
                      value={formData.organizationSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600/30 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="acme-inc"
                      required
                      pattern="[a-z0-9-]+"
                      title="Only lowercase letters, numbers, and hyphens allowed"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose a unique identifier for your organization (lowercase, alphanumeric, hyphens only)
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!formData.organizationName || !formData.organizationSlug}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-purple-600"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Review Your Organization
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Organization Name</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {formData.organizationName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Organization URL</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        yustboard.com/{formData.organizationSlug}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Role</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Owner
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Free (5 users max)
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-purple-600"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      'Create Organization'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Need help? Contact support at support@yustboard.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
