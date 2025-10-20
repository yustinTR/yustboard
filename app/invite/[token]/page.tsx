'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/molecules/card'
import { FiCheck, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

interface InviteData {
  id: string
  email: string
  role: string
  organization: {
    name: string
    slug: string
  }
  expiresAt: string
  isExpired: boolean
  isAccepted: boolean
}

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [token, setToken] = useState<string>('')
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Unwrap params
  useEffect(() => {
    params.then(p => setToken(p.token))
  }, [params])

  // Fetch invite data
  useEffect(() => {
    if (!token) return

    async function fetchInvite() {
      try {
        const response = await fetch(`/api/invite/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch invite')
        }

        setInvite(data.invite)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invite')
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  const handleAccept = async () => {
    if (!token || !session?.user?.id) return

    setAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/invite/${token}/accept`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite')
      }

      setSuccess(true)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!token) return

    setDeclining(true)
    setError(null)

    try {
      const response = await fetch(`/api/invite/${token}/decline`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invite')
      }

      // Redirect after declining
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invite')
    } finally {
      setDeclining(false)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/invite/${token}`)
    }
  }, [status, router, token])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl p-8">
          <div className="animate-pulse text-center">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading invite...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Invite Accepted!</CardTitle>
            <CardDescription>
              You&apos;ve successfully joined the organization. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invite?.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl">Invite Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the organization administrator for a new invite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invite?.isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <FiCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Organization Invite</CardTitle>
          <CardDescription className="text-center">
            You&apos;ve been invited to join an organization
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/30 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
              {invite?.organization.name}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{invite?.email}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invite?.role === 'OWNER' ? 'Owner' :
                   invite?.role === 'ADMIN' ? 'Admin' :
                   invite?.role === 'VIEWER' ? 'Viewer' : 'Member'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invite && new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDecline}
              disabled={declining || accepting}
              variant="outline"
              className="flex-1"
            >
              {declining ? (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  Declining...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiX className="h-4 w-4" />
                  Decline
                </span>
              )}
            </Button>

            <Button
              onClick={handleAccept}
              disabled={accepting || declining}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {accepting ? (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  Accepting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiCheck className="h-4 w-4" />
                  Accept Invite
                </span>
              )}
            </Button>
          </div>

          {/* Logged in as */}
          {session?.user?.email && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Logged in as {session.user.email}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
