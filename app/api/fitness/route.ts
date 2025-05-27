import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { google } from 'googleapis'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: session.accessToken })

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client })
    
    // Get current date range (today)
    const endTime = new Date()
    const startTime = new Date()
    startTime.setHours(0, 0, 0, 0)
    
    // Get week start for weekly stats
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)
    
    const endTimeMillis = endTime.getTime()
    const startTimeMillis = startTime.getTime()
    const weekStartMillis = weekStart.getTime()

    try {
      // Fetch multiple data types in parallel
      const [stepsResponse, caloriesResponse, activeMinutesResponse, weeklyStepsResponse] = await Promise.all([
        // Today's steps
        fitness.users.dataset.aggregate({
          userId: 'me',
          requestBody: {
            aggregateBy: [{
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startTimeMillis.toString(),
            endTimeMillis: endTimeMillis.toString()
          }
        }),
        
        // Today's calories
        fitness.users.dataset.aggregate({
          userId: 'me',
          requestBody: {
            aggregateBy: [{
              dataTypeName: 'com.google.calories.expended',
              dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startTimeMillis.toString(),
            endTimeMillis: endTimeMillis.toString()
          }
        }),
        
        // Active minutes
        fitness.users.dataset.aggregate({
          userId: 'me',
          requestBody: {
            aggregateBy: [{
              dataTypeName: 'com.google.active_minutes',
              dataSourceId: 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startTimeMillis.toString(),
            endTimeMillis: endTimeMillis.toString()
          }
        }),
        
        // Weekly steps
        fitness.users.dataset.aggregate({
          userId: 'me',
          requestBody: {
            aggregateBy: [{
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
            startTimeMillis: weekStartMillis.toString(),
            endTimeMillis: endTimeMillis.toString()
          }
        })
      ])

      // Parse today's data
      const steps = stepsResponse.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0
      const calories = Math.round(caloriesResponse.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0)
      const activeMinutes = activeMinutesResponse.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0

      // Parse weekly data
      const weeklyStats = weeklyStepsResponse.data.bucket?.map((bucket, index) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + index)
        const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
        const steps = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0
        
        return {
          day: dayNames[date.getDay()],
          steps
        }
      }) || []

      // Return only real data
      return NextResponse.json({
        steps: { value: steps, goal: 10000 },
        calories: { value: calories, goal: 2500 },
        activeMinutes: { value: activeMinutes, goal: 60 },
        heartRate: { value: 0, min: 0, max: 0 }, // Heart rate requires different permissions
        weeklyStats
      })
    } catch (apiError: any) {
      console.error('Google Fit API error:', apiError)
      
      // Return error state instead of mock data
      return NextResponse.json({
        error: 'Google Fit not connected',
        message: 'Please reconnect to enable fitness tracking',
        details: apiError.message
      }, { status: 403 })
    }
  } catch (error) {
    console.error('Error fetching fitness data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fitness data' },
      { status: 500 }
    )
  }
}