import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/database/prisma'

// All available menu items with their Google requirement
const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', requiresGoogle: false },
  { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', requiresGoogle: false },
  { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', requiresGoogle: true },
  { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'Calendar', requiresGoogle: true },
  { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', requiresGoogle: false },
  { id: 'blog', label: 'Blog', path: '/dashboard/blog', icon: 'FileText', requiresGoogle: false },
  { id: 'news', label: 'Nieuws', path: '/dashboard/news', icon: 'Globe', requiresGoogle: false },
  { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', requiresGoogle: false },
  { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', requiresGoogle: false },
  { id: 'announcements', label: 'Aankondigingen', path: '/dashboard/announcements', icon: 'Bell', requiresGoogle: false },
  { id: 'tasks', label: 'Taken', path: '/dashboard/tasks', icon: 'CheckSquare', requiresGoogle: false },
  { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', requiresGoogle: false }
]

// Get public menu settings (available to all authenticated users)
export async function GET() {
  try {
    const session = await getServerSession()

    // Check if user has Google linked
    let hasGoogleLinked = false
    let organizationId: string | null = null

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          organizationId: true,
          accounts: {
            where: { provider: 'google' },
            select: { id: true }
          }
        }
      })
      hasGoogleLinked = (user?.accounts?.length ?? 0) > 0
      organizationId = user?.organizationId ?? null
    }

    // Get organization menu settings if user has an organization
    let orgMenuSettings: Array<{ menuItemId: string; enabled: boolean; position: number }> = []
    if (organizationId) {
      orgMenuSettings = await prisma.organizationMenuDefault.findMany({
        where: { organizationId },
        orderBy: { position: 'asc' },
        select: {
          menuItemId: true,
          enabled: true,
          position: true
        }
      })
    }

    // Build menu items
    let menuItems = allMenuItems.map((item, index) => {
      const orgSetting = orgMenuSettings.find(s => s.menuItemId === item.id)
      return {
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.icon,
        requiresGoogle: item.requiresGoogle,
        enabled: orgSetting ? orgSetting.enabled : true,
        position: orgSetting ? orgSetting.position : index
      }
    })

    // Filter out Google items for users without Google linked
    menuItems = menuItems.filter(item => !item.requiresGoogle || hasGoogleLinked)

    // Sort by position
    menuItems.sort((a, b) => a.position - b.position)

    // Remove requiresGoogle from response (not needed by client)
    const responseItems = menuItems.map(({ requiresGoogle: _rg, ...item }) => item)

    return NextResponse.json({ menuItems: responseItems })
  } catch (error) {
    console.error('Error fetching public menu settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu settings' },
      { status: 500 }
    )
  }
}