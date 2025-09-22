'use client'

import React, { useEffect, useState } from 'react'
import { FiCloud, FiCloudRain, FiCloudSnow, FiSun, FiRefreshCw, FiMapPin, FiThermometer, FiWind, FiDroplet, FiEye, FiBarChart, FiSearch } from 'react-icons/fi'

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

interface ExtendedWeatherData extends WeatherData {
  pressure?: number
  visibility?: number
  uvIndex?: number
  sunrise?: string
  sunset?: string
  hourlyForecast?: Array<{
    time: string
    temperature: number
    condition: string
    humidity: number
  }>
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<ExtendedWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState('')

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

              if (!response.ok) {
                throw new Error('Failed to fetch weather data')
              }

              const data = await response.json()

              // Enhance data with mock additional details for the extended weather page
              const enhancedData: ExtendedWeatherData = {
                ...data,
                pressure: 1013,
                visibility: 10,
                uvIndex: 5,
                sunrise: '07:30',
                sunset: '18:45',
                hourlyForecast: [
                  { time: '12:00', temperature: data.temperature + 1, condition: data.condition, humidity: data.humidity },
                  { time: '15:00', temperature: data.temperature + 2, condition: data.condition, humidity: data.humidity - 5 },
                  { time: '18:00', temperature: data.temperature - 1, condition: 'Clouds', humidity: data.humidity + 3 },
                  { time: '21:00', temperature: data.temperature - 3, condition: 'Clear', humidity: data.humidity },
                  { time: '00:00', temperature: data.temperature - 5, condition: 'Clear', humidity: data.humidity + 2 },
                  { time: '03:00', temperature: data.temperature - 7, condition: 'Clear', humidity: data.humidity + 5 },
                  { time: '06:00', temperature: data.temperature - 5, condition: 'Clouds', humidity: data.humidity + 3 },
                  { time: '09:00', temperature: data.temperature - 2, condition: data.condition, humidity: data.humidity },
                ]
              }

              setWeatherData(enhancedData)
              setLoading(false)
            } catch (fetchError) {
              console.error('Fetch error:', fetchError)
              setError('Weer data kon niet worden geladen')
              setLoading(false)
            }
          },
          async (error) => {
            console.error('Geolocation error:', error)
            // Fallback to default location (Amsterdam)
            try {
              const response = await fetch('/api/weather?lat=52.3676&lon=4.9041')
              if (response.ok) {
                const data = await response.json()
                const enhancedData: ExtendedWeatherData = {
                  ...data,
                  location: 'Amsterdam, Nederland (standaard locatie)',
                  pressure: 1013,
                  visibility: 10,
                  uvIndex: 5,
                  sunrise: '07:30',
                  sunset: '18:45',
                  hourlyForecast: [
                    { time: '12:00', temperature: data.temperature + 1, condition: data.condition, humidity: data.humidity },
                    { time: '15:00', temperature: data.temperature + 2, condition: data.condition, humidity: data.humidity - 5 },
                    { time: '18:00', temperature: data.temperature - 1, condition: 'Clouds', humidity: data.humidity + 3 },
                    { time: '21:00', temperature: data.temperature - 3, condition: 'Clear', humidity: data.humidity },
                    { time: '00:00', temperature: data.temperature - 5, condition: 'Clear', humidity: data.humidity + 2 },
                    { time: '03:00', temperature: data.temperature - 7, condition: 'Clear', humidity: data.humidity + 5 },
                    { time: '06:00', temperature: data.temperature - 5, condition: 'Clouds', humidity: data.humidity + 3 },
                    { time: '09:00', temperature: data.temperature - 2, condition: data.condition, humidity: data.humidity },
                  ]
                }
                setWeatherData(enhancedData)
                setError('Getoond: standaard locatie (Amsterdam). Sta locatie toegang toe voor lokale gegevens.')
              } else {
                setError('Locatie toegang geweigerd en standaard locatie kon niet worden geladen.')
              }
            } catch {
              setError('Locatie toegang geweigerd en standaard locatie kon niet worden geladen.')
            }
            setLoading(false)
          },
          {
            timeout: 10000, // 10 second timeout
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        // Fallback to default location (Amsterdam) when geolocation is not supported
        try {
          const response = await fetch('/api/weather?lat=52.3676&lon=4.9041')
          if (response.ok) {
            const data = await response.json()
            const enhancedData: ExtendedWeatherData = {
              ...data,
              location: 'Amsterdam, Nederland (standaard locatie)',
              pressure: 1013,
              visibility: 10,
              uvIndex: 5,
              sunrise: '07:30',
              sunset: '18:45',
              hourlyForecast: [
                { time: '12:00', temperature: data.temperature + 1, condition: data.condition, humidity: data.humidity },
                { time: '15:00', temperature: data.temperature + 2, condition: data.condition, humidity: data.humidity - 5 },
                { time: '18:00', temperature: data.temperature - 1, condition: 'Clouds', humidity: data.humidity + 3 },
                { time: '21:00', temperature: data.temperature - 3, condition: 'Clear', humidity: data.humidity },
                { time: '00:00', temperature: data.temperature - 5, condition: 'Clear', humidity: data.humidity + 2 },
                { time: '03:00', temperature: data.temperature - 7, condition: 'Clear', humidity: data.humidity + 5 },
                { time: '06:00', temperature: data.temperature - 5, condition: 'Clouds', humidity: data.humidity + 3 },
                { time: '09:00', temperature: data.temperature - 2, condition: data.condition, humidity: data.humidity },
              ]
            }
            setWeatherData(enhancedData)
            setError('Geolocation niet ondersteund. Getoond: standaard locatie (Amsterdam).')
          } else {
            setError('Geolocation niet ondersteund en standaard locatie kon niet worden geladen.')
          }
        } catch {
          setError('Geolocation niet ondersteund en standaard locatie kon niet worden geladen.')
        }
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
  }, [])

  const getWeatherIcon = (condition: string, size = 'h-8 w-8') => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <FiSun className={`${size} text-yellow-500`} />
    } else if (conditionLower.includes('rain')) {
      return <FiCloudRain className={`${size} text-blue-500`} />
    } else if (conditionLower.includes('snow')) {
      return <FiCloudSnow className={`${size} text-blue-300`} />
    } else {
      return <FiCloud className={`${size} text-gray-500 dark:text-gray-400`} />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <FiRefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Weerdata wordt geladen...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !weatherData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <FiCloud className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Weerdata kon niet worden geladen</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchWeatherData}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-blue-400/30"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Weer</h1>
          <p className="text-gray-600 dark:text-gray-400">Uitgebreide weersvoorspelling en details</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 dark:text-gray-500 h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              placeholder="Zoek locatie..."
            />
          </div>
          <button
            onClick={fetchWeatherData}
            className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-blue-400/30"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Current Weather - Large Card */}
      <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-sm text-white">
          <div className="flex items-center mb-4">
            <FiMapPin className="text-white/80 mr-2 h-5 w-5" />
            <h2 className="text-2xl font-semibold">{weatherData.location}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex items-center">
              <div className="mr-8">
                {getWeatherIcon(weatherData.condition, 'h-20 w-20')}
              </div>
              <div>
                <p className="text-6xl font-bold mb-2">{Math.round(weatherData.temperature)}°C</p>
                <p className="text-white/90 text-xl capitalize mb-1">{weatherData.description}</p>
                <p className="text-white/80">Voelt als {Math.round(weatherData.feels_like)}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiDroplet className="text-white h-5 w-5" />
                  <span className="text-white/80">Vochtigheid</span>
                </div>
                <span className="text-2xl font-bold">{weatherData.humidity}%</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiWind className="text-white h-5 w-5" />
                  <span className="text-white/80">Wind</span>
                </div>
                <span className="text-2xl font-bold">{weatherData.wind_speed} km/u</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiBarChart className="text-white h-5 w-5" />
                  <span className="text-white/80">Druk</span>
                </div>
                <span className="text-2xl font-bold">{weatherData.pressure || 1013} hPa</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiEye className="text-white h-5 w-5" />
                  <span className="text-white/80">Zicht</span>
                </div>
                <span className="text-2xl font-bold">{weatherData.visibility || 10} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Forecast */}
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
          <div className="p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">24-uurs voorspelling</h2>
          </div>
          <div className="p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {weatherData.hourlyForecast?.map((hour, index) => (
                <div key={index} className="flex items-center justify-between py-2 pr-4">
                  <span className="text-gray-600 dark:text-gray-400 w-16">{hour.time}</span>
                  <div className="flex items-center gap-3 flex-1 justify-center">
                    {getWeatherIcon(hour.condition, 'h-5 w-5')}
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{hour.humidity}%</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 w-16 text-right">{hour.temperature}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Forecast */}
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
          <div className="p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">5-daagse voorspelling</h2>
          </div>
          <div className="p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
            <div className="space-y-4">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-white/20 dark:bg-gray-800/20 rounded-xl backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
                >
                  <span className={`w-20 text-gray-900 dark:text-gray-100 ${index === 0 ? 'font-semibold' : ''}`}>
                    {index === 0 ? 'Vandaag' : day.day}
                  </span>
                  <div className="flex items-center w-20 justify-center">
                    {getWeatherIcon(day.condition, 'h-6 w-6')}
                  </div>
                  <div className="w-20 text-right">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{day.temperature}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Weather Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiSun className="h-6 w-6 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">UV Index</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{weatherData.uvIndex || 5}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gemiddeld</p>
        </div>

        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiSun className="h-6 w-6 text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Zonsopgang</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{weatherData.sunrise || '07:30'}</p>
        </div>

        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiSun className="h-6 w-6 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Zonsondergang</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{weatherData.sunset || '18:45'}</p>
        </div>

        <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiThermometer className="h-6 w-6 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Gevoelstemperatuur</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{Math.round(weatherData.feels_like)}°C</p>
        </div>
      </div>
    </div>
  )
}