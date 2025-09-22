import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/database/prisma'

// Get global menu settings (admin only)
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

    return NextResponse.json({ menuItems: menuSettings })
  } catch (error) {
    console.error('Error fetching menu settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu settings' },
      { status: 500 }
    )
  }
}

// Save global menu settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { menuItems } = await request.json()

    // Delete existing settings
    await prisma.globalMenuSetting.deleteMany({})

    // Create new settings
    for (const item of menuItems) {
      await prisma.globalMenuSetting.create({
        data: {
          menuItem: item.id,
          label: item.label,
          path: item.path,
          icon: item.icon,
          enabled: item.enabled,
          position: item.position
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving menu settings:', error)
    return NextResponse.json(
      { error: 'Failed to save menu settings' },
      { status: 500 }
    )
  }
}