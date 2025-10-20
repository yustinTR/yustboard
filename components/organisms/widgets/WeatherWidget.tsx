'use client'

import React, { useState, useEffect } from 'react'
import { FiCloud, FiCloudRain, FiCloudSnow, FiSun, FiRefreshCw, FiMapPin, FiThermometer, FiWind, FiDroplet } from 'react-icons/fi'
import Link from 'next/link'
import { useWeather } from '@/hooks/queries/useWeather'

const WeatherWidget = React.memo(function WeatherWidget() {
  // Default to Den Haag coordinates, will be updated with user location
  const [coords, setCoords] = useState({ lat: 52.0705, lon: 4.3007 })

  // Use React Query hook with user's coordinates
  const { data: weatherData, isLoading, error, refetch } = useWeather(coords.lat, coords.lon)

  // Get user's geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Keep using default Den Haag coordinates
        }
      )
    }
  }, [])

  const handleRefresh = () => {
    refetch()
  }

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

  if (isLoading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 flex items-center justify-center">
        <FiRefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !weatherData) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header with blue gradient for weather */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiCloud className="h-5 w-5" />
            Weer
          </h3>
          <button
            onClick={handleRefresh}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-8 bg-white/5 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
              {error?.message || 'Geen weerdata beschikbaar'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Sta locatie toegang toe voor weersinformatie
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with blue gradient for weather */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiCloud className="h-5 w-5" />
          Weer
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm space-y-6">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <FiMapPin className="h-4 w-4" />
              {weatherData.location}
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {Math.round(weatherData.temperature)}°C
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {weatherData.description}
            </p>
          </div>
          <div className="scale-125">
            {getWeatherIcon(weatherData.condition)}
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-3 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center gap-2 mb-1">
              <FiThermometer className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Voelt als</p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(weatherData.feels_like)}°C
            </p>
          </div>

          <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-3 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center gap-2 mb-1">
              <FiWind className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {weatherData.wind_speed} km/u
            </p>
          </div>

          <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-3 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center gap-2 mb-1">
              <FiDroplet className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Vochtigheid</p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {weatherData.humidity}%
            </p>
          </div>
        </div>

        {/* Forecast */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
            5-daagse voorspelling
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day) => (
              <div
                key={day.day}
                className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {day.day}
                </p>
                <div className="flex justify-center mb-2 scale-75">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(day.temperature)}°
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/weather"
          className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-blue-400/30 backdrop-blur-sm"
        >
          Bekijk uitgebreide voorspelling
        </Link>
      </div>
    </div>
  )
})

export default WeatherWidget
export { WeatherWidget }