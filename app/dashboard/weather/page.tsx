import { FiMapPin, FiSearch, FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind, FiDroplet } from 'react-icons/fi';

// Mock weather data (would come from API in real app)
const weatherData = {
  location: 'Amsterdam, NL',
  current: {
    temperature: 22,
    feelsLike: 23,
    condition: 'Sunny',
    humidity: 60,
    wind: 12,
    pressure: 1012,
    uvIndex: 5,
    time: '15:30',
  },
  hourly: [
    { time: '16:00', temperature: 21, condition: 'Sunny' },
    { time: '17:00', temperature: 20, condition: 'Sunny' },
    { time: '18:00', temperature: 19, condition: 'Cloudy' },
    { time: '19:00', temperature: 18, condition: 'Cloudy' },
    { time: '20:00', temperature: 17, condition: 'Cloudy' },
    { time: '21:00', temperature: 16, condition: 'Clear' },
    { time: '22:00', temperature: 15, condition: 'Clear' },
    { time: '23:00', temperature: 14, condition: 'Clear' },
  ],
  daily: [
    { day: 'Today', high: 22, low: 14, condition: 'Sunny' },
    { day: 'Wed', high: 20, low: 13, condition: 'Cloudy' },
    { day: 'Thu', high: 19, low: 12, condition: 'Rain' },
    { day: 'Fri', high: 21, low: 14, condition: 'Cloudy' },
    { day: 'Sat', high: 24, low: 15, condition: 'Sunny' },
    { day: 'Sun', high: 25, low: 16, condition: 'Sunny' },
    { day: 'Mon', high: 23, low: 15, condition: 'Cloudy' },
  ],
};

export default function WeatherPage() {
  const getWeatherIcon = (condition: string, size = 24) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <FiSun className="text-yellow-400" size={size} />;
    } else if (conditionLower.includes('rain')) {
      return <FiCloudRain className="text-blue-400" size={size} />;
    } else if (conditionLower.includes('snow')) {
      return <FiCloudSnow className="text-blue-200" size={size} />;
    } else {
      return <FiCloud className="text-gray-400 dark:text-gray-500" size={size} />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Weather</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Search location..."
          />
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FiMapPin className="text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">{weatherData.location}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <div className="mr-6">
                {getWeatherIcon(weatherData.current.condition, 64)}
              </div>
              <div>
                <p className="text-5xl font-bold">{weatherData.current.temperature}°C</p>
                <p className="text-gray-500 dark:text-gray-400">{weatherData.current.condition}</p>
                <p className="text-gray-500 dark:text-gray-400">Feels like {weatherData.current.feelsLike}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                <div className="flex items-center mt-1">
                  <FiDroplet className="text-blue-400 mr-2" />
                  <span>{weatherData.current.humidity}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
                <div className="flex items-center mt-1">
                  <FiWind className="text-blue-400 mr-2" />
                  <span>{weatherData.current.wind} km/h</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
                <span>{weatherData.current.pressure} hPa</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">UV Index</p>
                <span>{weatherData.current.uvIndex}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Hourly Forecast</h2>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            {weatherData.hourly.map((hour, index) => (
              <div key={index} className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{hour.time}</p>
                <div className="my-2">
                  {getWeatherIcon(hour.condition)}
                </div>
                <p className="font-medium">{hour.temperature}°C</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">7-Day Forecast</h2>
        </div>
        <div>
          {weatherData.daily.map((day, index) => (
            <div 
              key={index} 
              className={`p-4 flex items-center justify-between ${
                index < weatherData.daily.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <span className={`w-20 ${index === 0 ? 'font-medium' : ''}`}>{day.day}</span>
              <div className="flex items-center w-20">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="w-20 text-right">
                <span className="font-medium">{day.high}°</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}