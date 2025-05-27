'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Activity, Footprints, Flame, Heart, RefreshCw, TrendingUp } from 'lucide-react'

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

export default function FitnessWidget() {
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
      <Card className="h-full flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Fitness
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFitnessData}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">
              Log opnieuw in om Google Fit te verbinden
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!fitnessData) return null

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Fitness
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchFitnessData}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-blue-500" />
              <span>Stappen</span>
            </div>
            <span className={getProgressColor((fitnessData.steps.value / fitnessData.steps.goal) * 100)}>
              {fitnessData.steps.value.toLocaleString()} / {fitnessData.steps.goal.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={(fitnessData.steps.value / fitnessData.steps.goal) * 100} 
            className="h-2"
          />
        </div>

        {/* Calories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Calorieën</span>
            </div>
            <span className={getProgressColor((fitnessData.calories.value / fitnessData.calories.goal) * 100)}>
              {fitnessData.calories.value} / {fitnessData.calories.goal} kcal
            </span>
          </div>
          <Progress 
            value={(fitnessData.calories.value / fitnessData.calories.goal) * 100} 
            className="h-2"
          />
        </div>

        {/* Active Minutes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Actieve minuten</span>
            </div>
            <span className={getProgressColor((fitnessData.activeMinutes.value / fitnessData.activeMinutes.goal) * 100)}>
              {fitnessData.activeMinutes.value} / {fitnessData.activeMinutes.goal} min
            </span>
          </div>
          <Progress 
            value={(fitnessData.activeMinutes.value / fitnessData.activeMinutes.goal) * 100} 
            className="h-2"
          />
        </div>

        {/* Heart Rate */}
        {fitnessData.heartRate.value > 0 ? (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Hartslag</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{fitnessData.heartRate.value} bpm</div>
              <div className="text-xs text-muted-foreground">
                {fitnessData.heartRate.min} - {fitnessData.heartRate.max}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-50">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hartslag niet beschikbaar</span>
            </div>
          </div>
        )}

        {/* Weekly Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Deze week</h4>
          <div className="flex items-end justify-between gap-1 h-20">
            {fitnessData.weeklyStats.map((stat) => {
              const percentage = (stat.steps / 12000) * 100
              return (
                <div key={stat.day} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.min(percentage, 100)}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{stat.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}