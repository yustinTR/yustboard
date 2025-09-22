import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'

// OpenWeatherMap - Free tier: 1000 calls/day
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || ''
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'

console.log('Weather API Key loaded:', WEATHER_API_KEY ? `${WEATHER_API_KEY.substring(0, 8)}...` : 'NOT FOUND')

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 })
    }
    
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_api_key_here' || WEATHER_API_KEY.includes('your_')) {
      console.warn('OPENWEATHER_API_KEY not configured. Please get a free API key from https://openweathermap.org/api')
      // Return mock data for development
      return NextResponse.json({
        temperature: 18,
        feels_like: 16,
        condition: 'Clouds',
        description: 'overcast clouds',
        location: 'Den Haag',
        humidity: 65,
        wind_speed: 12,
        forecast: [
          { day: 'Ma', temperature: 19, condition: 'Clouds' },
          { day: 'Di', temperature: 17, condition: 'Rain' },
          { day: 'Wo', temperature: 20, condition: 'Clear' },
          { day: 'Do', temperature: 18, condition: 'Clouds' },
          { day: 'Vr', temperature: 16, condition: 'Rain' }
        ]
      })
    }

    // Fetch current weather
    const currentWeatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl`
    const forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl&cnt=5`
    
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      console.error('Weather API Error:', {
        currentStatus: currentResponse.status,
        currentStatusText: currentResponse.statusText,
        forecastStatus: forecastResponse.status,
        forecastStatusText: forecastResponse.statusText
      })

      // If API key is invalid, return mock data
      if (currentResponse.status === 401 || forecastResponse.status === 401) {
        console.warn('Invalid OpenWeatherMap API key. Please get a valid API key from https://openweathermap.org/api')
        return NextResponse.json({
          temperature: 18,
          feels_like: 16,
          condition: 'Clouds',
          description: 'overcast clouds',
          location: 'Den Haag',
          humidity: 65,
          wind_speed: 12,
          forecast: [
            { day: 'Ma', temperature: 19, condition: 'Clouds' },
            { day: 'Di', temperature: 17, condition: 'Rain' },
            { day: 'Wo', temperature: 20, condition: 'Clear' },
            { day: 'Do', temperature: 18, condition: 'Clouds' },
            { day: 'Vr', temperature: 16, condition: 'Rain' }
          ],
          isMockData: true,
          message: 'Using mock data. Please configure a valid OpenWeatherMap API key.'
        })
      }

      // Return mock data for any other errors too
      return NextResponse.json({
        temperature: 18,
        feels_like: 16,
        condition: 'Clouds',
        description: 'overcast clouds',
        location: 'Den Haag',
        humidity: 65,
        wind_speed: 12,
        forecast: [
          { day: 'Ma', temperature: 19, condition: 'Clouds' },
          { day: 'Di', temperature: 17, condition: 'Rain' },
          { day: 'Wo', temperature: 20, condition: 'Clear' },
          { day: 'Do', temperature: 18, condition: 'Clouds' },
          { day: 'Vr', temperature: 16, condition: 'Rain' }
        ],
        isMockData: true,
        message: 'Weather service temporarily unavailable. Showing mock data.'
      })
    }

    const currentData = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    // Parse forecast data - get daily max temps
    const dailyForecasts = forecastData.list.map((item: { dt: number; main: { temp: number }; weather: [{ main: string }] }) => ({
      day: new Date(item.dt * 1000).toLocaleDateString('nl-NL', { weekday: 'short' }),
      temperature: Math.round(item.main.temp),
      condition: item.weather[0].main
    }))

    return NextResponse.json({
      temperature: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      location: currentData.name,
      humidity: currentData.main.humidity,
      wind_speed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
      forecast: dailyForecasts
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}