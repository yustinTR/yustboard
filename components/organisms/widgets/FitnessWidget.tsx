'use client'

import React, { useEffect, useState } from 'react'
import { FiActivity, FiZap, FiHeart, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'

interface FitnessData {
  steps: {
    value: number
    goal: number
  }
  calories: {
    value: number
    goal: number
  }
  activeMinutes: {
    value: number
    goal: number
  }
  heartRate: {
    value: number
    min: number
    max: number
  }
  weeklyStats: {
    day: string
    steps: number
  }[]
}

const FitnessWidget = React.memo(function FitnessWidget() {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFitnessData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/fitness')
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.message || 'Fitness data kon niet worden geladen')
        setFitnessData(null)
      } else {
        setFitnessData(data)
      }
    } catch (error) {
      console.error('Error fetching fitness data:', error)
      setError('Fitness data kon niet worden geladen')
      setFitnessData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFitnessData()
    const interval = setInterval(fetchFitnessData, 5 * 60 * 1000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-500'
    if (percentage >= 70) return 'text-yellow-500'
    return 'text-blue-500'
  }

  if (loading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with orange gradient for fitness */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiActivity className="h-5 w-5" />
            Fitness
          </h3>
        </div>

        {/* Loading Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center">
            <FiRefreshCw className="h-8 w-8 animate-spin text-orange-500 mr-3" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Loading fitness data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with orange gradient for fitness */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiActivity className="h-5 w-5" />
            Fitness
          </h3>
          <button
            onClick={fetchFitnessData}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-sm font-medium mb-2">{error}</p>
              <p className="text-xs">Log opnieuw in om Google Fit te verbinden</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!fitnessData) return null

  // Custom Progress component
  const ProgressBar = ({ value, className }: { value: number; className?: string }) => (
    <div className={`bg-white/20 dark:bg-gray-800/20 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/30 dark:border-gray-600/30 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with orange gradient for fitness */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiActivity className="h-5 w-5" />
          Fitness
        </h3>
        <button
          onClick={fetchFitnessData}
          disabled={loading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm space-y-4 overflow-y-auto">
        {/* Steps */}
        <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <FiActivity className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Stappen</span>
            </div>
            <span className={`font-semibold ${getProgressColor((fitnessData.steps.value / fitnessData.steps.goal) * 100)}`}>
              {fitnessData.steps.value.toLocaleString()} / {fitnessData.steps.goal.toLocaleString()}
            </span>
          </div>
          <ProgressBar value={(fitnessData.steps.value / fitnessData.steps.goal) * 100} />
        </div>

        {/* Calories */}
        <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <FiZap className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Calorieën</span>
            </div>
            <span className={`font-semibold ${getProgressColor((fitnessData.calories.value / fitnessData.calories.goal) * 100)}`}>
              {fitnessData.calories.value} / {fitnessData.calories.goal} kcal
            </span>
          </div>
          <ProgressBar value={(fitnessData.calories.value / fitnessData.calories.goal) * 100} />
        </div>

        {/* Active Minutes */}
        <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Actieve minuten</span>
            </div>
            <span className={`font-semibold ${getProgressColor((fitnessData.activeMinutes.value / fitnessData.activeMinutes.goal) * 100)}`}>
              {fitnessData.activeMinutes.value} / {fitnessData.activeMinutes.goal} min
            </span>
          </div>
          <ProgressBar value={(fitnessData.activeMinutes.value / fitnessData.activeMinutes.goal) * 100} />
        </div>

        {/* Heart Rate */}
        {fitnessData.heartRate.value > 0 ? (
          <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiHeart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Hartslag</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{fitnessData.heartRate.value} bpm</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {fitnessData.heartRate.min} - {fitnessData.heartRate.max}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 dark:bg-gray-800/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 opacity-50">
            <div className="flex items-center gap-2">
              <FiHeart className="h-4 w-4 text-gray-500 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-500">Hartslag niet beschikbaar</span>
            </div>
          </div>
        )}

        {/* Weekly Stats */}
        <div className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Deze week</h4>
          <div className="flex items-end justify-between gap-2 h-20">
            {fitnessData.weeklyStats.map((stat) => {
              const percentage = (stat.steps / 12000) * 100
              return (
                <div key={stat.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-white/20 dark:bg-gray-700/20 rounded-t relative overflow-hidden" style={{ height: '60px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.min(percentage, 100)}%`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <a
          href="/dashboard/fitness"
          className="block w-full text-center bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-orange-400/30 backdrop-blur-sm"
        >
          Bekijk gedetailleerde statistieken
        </a>
      </div>
    </div>
  )
});

export default FitnessWidget;