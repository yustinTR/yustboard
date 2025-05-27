import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get public menu settings (available to all authenticated users)
export async function GET() {
  try {
    // Get menu settings
    const menuSettings = await prisma.globalMenuSetting.findMany({
      orderBy: { position: 'asc' }
    })

    // If no settings exist, return defaults
    if (menuSettings.length === 0) {
      const defaultMenuItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', enabled: true, position: 0 },
        { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', enabled: true, position: 1 },
        { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', enabled: true, position: 2 },
        { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'Calendar', enabled: true, position: 3 },
        { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', enabled: true, position: 4 },
        { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', enabled: true, position: 5 },
        { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', enabled: true, position: 6 },
        { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', enabled: true, position: 7 }
      ]
      
      return NextResponse.json({ menuItems: defaultMenuItems })
    }

    // Transform to match expected format
    const menuItems = menuSettings.map(item => ({
      id: item.menuItem,
      label: item.label,
      path: item.path,
      icon: item.icon || 'Home',
      enabled: item.enabled,
      position: item.position
    }))

    return NextResponse.json({ menuItems })
  } catch (error) {
    console.error('Error fetching public menu settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu settings' },
      { status: 500 }
    )
  }
}