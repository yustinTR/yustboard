import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/database/prisma'

// Define all available widgets
const allWidgets = [
  { id: 'timeline', name: 'Timeline', description: 'Sociale tijdlijn met posts', requiresGoogle: false },
  { id: 'activity', name: 'Activiteit', description: 'Team activiteiten feed', requiresGoogle: false },
  { id: 'tasks', name: 'Taken', description: 'Team taken en to-dos', requiresGoogle: false },
  { id: 'calendar', name: 'Agenda', description: 'Team agenda en evenementen', requiresGoogle: false },
  { id: 'banking', name: 'Banking', description: 'Financiële transacties', requiresGoogle: false },
  { id: 'gmail', name: 'Gmail', description: 'Recente emails', requiresGoogle: true },
  { id: 'files', name: 'Bestanden', description: 'Google Drive bestanden', requiresGoogle: true },
  { id: 'weather', name: 'Weer', description: 'Weersvoorspelling', requiresGoogle: false },
  { id: 'social', name: 'Sociaal', description: 'Social media feeds', requiresGoogle: false },
  { id: 'news', name: 'Nieuws', description: 'Laatste nieuws', requiresGoogle: false },
  { id: 'fitness', name: 'Fitness', description: 'Google Fit data', requiresGoogle: true },
  { id: 'blog', name: 'Blog', description: 'Laatste blog posts', requiresGoogle: false },
  { id: 'announcements', name: 'Aankondigingen', description: 'Organisatie aankondigingen', requiresGoogle: false }
]

// Get user widget preferences
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization and check for Google account
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

    const hasGoogleLinked = (user?.accounts?.length ?? 0) > 0

    // Filter widgets based on Google connection
    const availableWidgets = allWidgets.filter(
      widget => !widget.requiresGoogle || hasGoogleLinked
    )

    // Get user's widget preferences
    let preferences = await prisma.userWidgetPreference.findMany({
      where: { userId: session.user.id },
      orderBy: { position: 'asc' }
    })

    // If user has no preferences yet, try to apply organization defaults
    if (preferences.length === 0 && user?.organizationId) {
      const orgDefaults = await prisma.organizationWidgetDefault.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { position: 'asc' }
      })

      // Apply organization defaults for new users
      if (orgDefaults.length > 0) {
        await prisma.userWidgetPreference.createMany({
          data: orgDefaults.map((defaultWidget) => ({
            userId: session.user.id,
            organizationId: user.organizationId!,
            widgetId: defaultWidget.widgetId,
            enabled: defaultWidget.enabled,
            position: defaultWidget.position,
            settings: defaultWidget.settings ?? undefined
          }))
        })

        // Refetch the newly created preferences
        preferences = await prisma.userWidgetPreference.findMany({
          where: { userId: session.user.id },
          orderBy: { position: 'asc' }
        })
      }
    }

    // Merge preferences with widget definitions (only available widgets)
    const widgets = availableWidgets.map((widget, index) => {
      const pref = preferences.find(p => p.widgetId === widget.id)
      return {
        ...widget,
        enabled: pref ? pref.enabled : true, // Default to enabled
        position: pref ? pref.position : index,
        settings: pref?.settings || null
      }
    })

    // Sort by position
    widgets.sort((a, b) => a.position - b.position)

    return NextResponse.json({ widgets }, {
      headers: {
        'Cache-Control': 'private, max-age=180, stale-while-revalidate=360'
      }
    })
  } catch (error) {
    console.error('Error fetching widget preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widget preferences' },
      { status: 500 }
    )
  }
}

// Save user widget preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User must belong to an organization' }, { status: 400 })
    }

    const { widgets } = await request.json()

    // Update or create preferences for each widget
    for (const widget of widgets) {
      await prisma.userWidgetPreference.upsert({
        where: {
          userId_widgetId_organizationId: {
            userId: session.user.id,
            widgetId: widget.id,
            organizationId: user.organizationId
          }
        },
        update: {
          enabled: widget.enabled,
          position: widget.position,
          settings: widget.settings || null
        },
        create: {
          userId: session.user.id,
          widgetId: widget.id,
          organizationId: user.organizationId,
          enabled: widget.enabled,
          position: widget.position,
          settings: widget.settings || null
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving widget preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save widget preferences' },
      { status: 500 }
    )
  }
}