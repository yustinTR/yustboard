import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/database/prisma'

// Get user widget preferences
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's widget preferences
    const preferences = await prisma.userWidgetPreference.findMany({
      where: { userId: session.user.id },
      orderBy: { position: 'asc' }
    })

    // Define all available widgets
    const allWidgets = [
      { id: 'timeline', name: 'Timeline', description: 'Sociale tijdlijn met posts' },
      { id: 'tasks', name: 'Taken', description: 'Google Calendar evenementen' },
      { id: 'banking', name: 'Banking', description: 'Financiële transacties' },
      { id: 'gmail', name: 'Gmail', description: 'Recente emails' },
      { id: 'files', name: 'Bestanden', description: 'Google Drive bestanden' },
      { id: 'weather', name: 'Weer', description: 'Weersvoorspelling' },
      { id: 'social', name: 'Sociaal', description: 'Social media feeds' },
      { id: 'news', name: 'Nieuws', description: 'Laatste nieuws' },
      { id: 'fitness', name: 'Fitness', description: 'Google Fit data' },
      { id: 'blog', name: 'Blog', description: 'Laatste blog posts' }
    ]

    // Merge preferences with widget definitions
    const widgets = allWidgets.map((widget, index) => {
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

    return NextResponse.json({ widgets })
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

    const { widgets } = await request.json()

    // Update or create preferences for each widget
    for (const widget of widgets) {
      await prisma.userWidgetPreference.upsert({
        where: {
          userId_widgetId: {
            userId: session.user.id,
            widgetId: widget.id
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