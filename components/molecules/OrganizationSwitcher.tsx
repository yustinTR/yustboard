'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { FiCheck, FiChevronDown, FiPlus } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
}

interface OrganizationSwitcherProps {
  className?: string
}

export default function OrganizationSwitcher({ className = '' }: OrganizationSwitcherProps) {
  const { data: session } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user's organizations
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/user/organizations')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organizations || [])
          setCurrentOrg(data.current || null)
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const isButtonClick = buttonRef.current?.contains(target)
      const isDropdownClick = showDropdown && event.target &&
        (event.target as Element).closest('[data-org-dropdown]')

      if (!isButtonClick && !isDropdownClick) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDropdown])

  const switchOrganization = async (orgId: string) => {
    if (switching || orgId === currentOrg?.id) return

    setSwitching(true)
    try {
      const response = await fetch('/api/user/organizations/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId })
      })

      if (!response.ok) throw new Error('Failed to switch organization')

      const data = await response.json()
      setCurrentOrg(data.organization)
      setShowDropdown(false)
      toast.success(`Gewisseld naar ${data.organization.name}`)

      // Refresh the page to load new organization data
      window.location.reload()
    } catch (error) {
      console.error('Error switching organization:', error)
      toast.error('Fout bij het wisselen van organisatie')
    } finally {
      setSwitching(false)
    }
  }

  if (loading || !currentOrg) return null

  // Don't show switcher if user only has one organization
  if (organizations.length <= 1) return null

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          setShowDropdown(!showDropdown)
          if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect())
          }
        }}
        disabled={switching}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur-sm border border-white/10 dark:border-gray-700/30"
      >
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500 dark:text-gray-400">Organisatie</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentOrg.name}
          </span>
        </div>
        <FiChevronDown
          className={`h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown - render via portal */}
      {mounted && showDropdown && buttonRect && createPortal(
        <div
          data-org-dropdown
          className="fixed backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 py-2 z-[10000]"
          style={{
            top: buttonRect.bottom + 8,
            left: buttonRect.left,
            width: buttonRect.width,
            minWidth: '240px'
          }}
        >
          <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Wissel van organisatie
          </div>

          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrganization(org.id)}
                disabled={switching}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{org.plan}</span>
                </div>
                {org.id === currentOrg.id && (
                  <FiCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 dark:border-gray-700/30 mt-2 pt-2">
            <button
              onClick={() => {
                setShowDropdown(false)
                toast.info('Nieuwe organisatie aanmaken - binnenkort beschikbaar!')
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              Nieuwe organisatie
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
