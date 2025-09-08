import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth/auth"

// OpenWeatherMap - Free tier: 1000 calls/day
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || ''
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 })
    }
    
    if (!WEATHER_API_KEY) {
      console.warn('OPENWEATHER_API_KEY not found. Please get a free API key from https://openweathermap.org/api')
      return NextResponse.json({
        error: 'Weather API key not configured',
        message: 'Get a free key at https://openweathermap.org/api'
      }, { status: 500 })
    }

    // Fetch current weather
    const currentWeatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl`
    const forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl&cnt=5`
    
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data')
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