import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface WeatherData {
  temperature: number;
  feels_like: number;
  condition: string;
  description: string;
  location: string;
  humidity: number;
  wind_speed: number;
  forecast: Array<{
    day: string;
    temperature: number;
    condition: string;
  }>;
  isMockData?: boolean;
  message?: string;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
}

export function useWeather(lat: number = 52.0705, lon: number = 4.3007) {
  return useQuery({
    queryKey: queryKeys.weather.current(lat, lon),
    queryFn: () => fetchWeather(lat, lon),
    staleTime: 10 * 60 * 1000, // 10 minutes (weather doesn't change often)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
