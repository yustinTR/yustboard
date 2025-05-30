'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cloud, CloudRain, CloudSnow, Sun, RefreshCw, MapPin, Thermometer, Wind, Droplets } from 'lucide-react'
import Link from 'next/link'

interface WeatherData {
  temperature: number
  condition: string
  description: string
  location: string
  feels_like: number
  humidity: number
  wind_speed: number
  forecast: Array<{
    day: string
    temperature: number
    condition: string
  }>
}

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
            
            if (!response.ok) {
              throw new Error('Failed to fetch weather data')
            }
            
            const data = await response.json()
            setWeatherData(data)
            setLoading(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setError('Locatie toegang geweigerd')
            setLoading(false)
          }
        )
      } else {
        setError('Geolocation niet ondersteund')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      setError('Weer data kon niet worden geladen')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000) // Update every 30 minutes
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun className="h-8 w-8 text-yellow-500" />
    } else if (conditionLower.includes('rain')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className="h-8 w-8 text-blue-300" />
    } else {
      return <Cloud className="h-8 w-8 text-gray-500 dark:text-gray-400" />
    }
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error || !weatherData) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5" />
              Weer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchWeatherData}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">{error || 'Geen weerdata beschikbaar'}</p>
            <p className="text-xs text-muted-foreground">
              Sta locatie toegang toe voor weersinformatie
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5" />
            Weer
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchWeatherData}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              {weatherData.location}
            </div>
            <div className="text-3xl font-bold">{Math.round(weatherData.temperature)}°C</div>
            <p className="text-sm text-muted-foreground capitalize">{weatherData.description}</p>
          </div>
          <div>{getWeatherIcon(weatherData.condition)}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Voelt als</p>
              <p className="font-medium">{Math.round(weatherData.feels_like)}°C</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-medium">{weatherData.wind_speed} km/u</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Vochtigheid</p>
              <p className="font-medium">{weatherData.humidity}%</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Voorspelling</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-medium">{Math.round(day.temperature)}°</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <div className="p-3 border-t border-border text-center">
        <Link 
          href="/dashboard/weather" 
          className="text-sm text-primary hover:underline"
        >
          Bekijk uitgebreide voorspelling →
        </Link>
      </div>
    </Card>
  )
}