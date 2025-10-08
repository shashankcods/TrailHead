import React from "react";

// data to be received from backend
export interface WeatherData {
  date: string; 
  maxTemp: number;
  minTemp: number;
  rainChance: number;
  condition: string;
}

interface WeatherForecastProps {
  weatherData: WeatherData[];
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ 
  weatherData 
}) => {
  // to display weather icon corresponding to condition
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return '☀️';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return '☁️';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return '🌧️';
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return '⛈️';
    } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return '❄️';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return '🌫️';
    } else if (conditionLower.includes('wind')) {
      return '💨';
    } else if (conditionLower.includes('partly')) {
      return '⛅';
    } else {
      return '🌈'; // default icon
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full backdrop-blur-md rounded-2xl p-4 mt-6">
    <h3 className="text-white text-xl font-bold mb-4 font-family-ubuntu flex justify-center">
        Weather Forecast
    </h3>

    {/* Scrollable container */}
    <div className="overflow-x-auto">
        {/* Inner flex container to center cards */}
        <div className="flex justify-center space-x-4 pb-4 min-w-max">
        {weatherData.map((day, index) => (
            <div
            key={index}
            className="w-40 bg-black/20 rounded-xl p-4 text-white text-center hover:bg-black/30 transition-colors duration-300"
            >
            {/* Date */}
            <div className="font-semibold text-sm mb-2">
                {formatDate(day.date)}
            </div>

            {/* Weather Icon */}
            <div className="text-3xl mb-2">
                {getWeatherIcon(day.condition)}
            </div>

            {/* Condition */}
            <div className="text-xs text-gray-200 mb-2 capitalize">
                {day.condition}
            </div>

            {/* Temperatures */}
            <div className="flex justify-between text-sm mb-1">
                <span className="text-red-300">H: {day.maxTemp}°</span>
                <span className="text-blue-300">L: {day.minTemp}°</span>
            </div>

            {/* Rain Chance */}
            <div className="text-xs text-cyan-300">
                💧 {day.rainChance}%
            </div>
            </div>
        ))}
        </div>
    </div>
    </div>
  );
};

export default WeatherForecast;