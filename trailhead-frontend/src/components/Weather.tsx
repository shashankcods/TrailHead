import React from "react";

export interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainAmount: number;
  condition: string;
}

interface WeatherForecastProps {
  weatherData: WeatherData[];
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ weatherData }) => {
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("clear")) return "/weather/clear.svg";
    if (c.includes("partly")) return "/weather/partly-cloudy.svg";
    if (c.includes("cloud")) return "/weather/cloudy.svg";
    if (c.includes("fog") || c.includes("rime")) return "/weather/frog.svg";
    if (c.includes("drizzle")) return "/weather/drizzle.svg";
    if (c.includes("rain") || c.includes("showers")) return "/weather/rain.svg";
    if (c.includes("snow")) return "/weather/snow.svg";
    if (c.includes("thunder")) return "/weather/thunderstorm.svg";
    return "/weather/clear.svg"; 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full mt-4 mb-10 p-4">
      <h3 className="text-white text-2xl font-bold mb-6 text-center">
        Weather
      </h3>

      <div className="flex flex-col gap-4 max-h-[820px] overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-hide px-2">
    {weatherData.map((day, index) => (
    <div
      key={index}
      className="snap-start 
        bg-gradient-to-br from-white/10 via-white/5 to-transparent
        backdrop-blur-2xl
        border border-white/20
        rounded-xl p-5 text-white text-center
        hover:bg-white/20
        transition-all duration-300
        w-100
        h-48
        mx-auto"
    >

        <div className="font-semibold text-sm mb-4">
          {formatDate(day.date)}
        </div>
        <img
          src={getWeatherIcon(day.condition)}
          alt={day.condition}
          className="w-15 h-12 mx-auto mb-2"
        />
        <div className="text-sm text-gray-200 mb-2 -mt-2 capitalize font-family-opensans">
          {day.condition}
        </div>
        <div className="flex justify-between text-sm mb-1 px-15">
          <span className="text-red-300">H: {day.maxTemp}°C</span>
          <span className="text-blue-300">L: {day.minTemp}°C</span>
        </div>
        <div className="text-xs text-cyan-300">💧 {day.rainAmount}mm</div>
      </div>
    ))}
  </div>


      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WeatherForecast;














