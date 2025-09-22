import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return mock data for now - Google Fitness API integration needs proper setup
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    // Mock weekly stats
    const weeklyStats = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weeklyStats.push({
        date: date.toISOString().split('T')[0],
        steps: Math.floor(Math.random() * 5000) + 3000
      })
    }

    return NextResponse.json({
      steps: { value: 8543, goal: 10000 },
      calories: { value: 420, goal: 500 },
      activeMinutes: { value: 45, goal: 60 },
      heartRate: { value: 72, min: 60, max: 100 },
      weeklyStats
    })
  } catch (error) {
    console.error('Fitness API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fitness data' },
      { status: 500 }
    )
  }
}