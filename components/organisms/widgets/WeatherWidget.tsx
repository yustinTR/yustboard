'use client'

import React, { useEffect, useState } from 'react'
import { FiCloud, FiCloudRain, FiCloudSnow, FiSun, FiRefreshCw, FiMapPin, FiThermometer, FiWind, FiDroplet } from 'react-icons/fi'
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

const WeatherWidget = React.memo(function WeatherWidget() {
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
      return <FiSun className="h-8 w-8 text-yellow-500" />
    } else if (conditionLower.includes('rain')) {
      return <FiCloudRain className="h-8 w-8 text-blue-500" />
    } else if (conditionLower.includes('snow')) {
      return <FiCloudSnow className="h-8 w-8 text-blue-300" />
    } else {
      return <FiCloud className="h-8 w-8 text-gray-500 dark:text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="h-full backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 flex items-center justify-center">
        <FiRefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !weatherData) {
    return (
      <div className="h-full backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <FiCloud className="h-5 w-5" />
              Weer
            </h3>
            <button
              onClick={fetchWeatherData}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 bg-white/5 backdrop-blur-sm flex items-center justify-center h-32">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">{error || 'Geen weerdata beschikbaar'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Sta locatie toegang toe voor weersinformatie
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <FiCloud className="h-5 w-5" />
            Weer
          </h3>
          <button
            onClick={fetchWeatherData}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 bg-white/5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <FiMapPin className="h-3 w-3" />
              {weatherData.location}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{Math.round(weatherData.temperature)}°C</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{weatherData.description}</p>
          </div>
          <div>{getWeatherIcon(weatherData.condition)}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FiThermometer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Voelt als</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{Math.round(weatherData.feels_like)}°C</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FiWind className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Wind</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{weatherData.wind_speed} km/u</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FiDroplet className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Vochtigheid</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{weatherData.humidity}%</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Voorspelling</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{day.day}</p>
                <div className="flex justify-center mb-1 scale-75">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.round(day.temperature)}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center">
        <Link 
          href="/dashboard/weather" 
          className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
        >
          Bekijk uitgebreide voorspelling →
        </Link>
      </div>
    </div>
  )
})

export default WeatherWidget
export { WeatherWidget }