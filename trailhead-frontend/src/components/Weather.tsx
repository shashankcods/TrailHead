import React, { useRef, useEffect } from "react";

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

const WeatherForecast: React.FC<WeatherForecastProps> = ({ weatherData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // scrolling using drag
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const startDragging = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const stopDragging = () => (isDown = false);
    const onDrag = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", startDragging);
    el.addEventListener("mouseleave", stopDragging);
    el.addEventListener("mouseup", stopDragging);
    el.addEventListener("mousemove", onDrag);

    return () => {
      el.removeEventListener("mousedown", startDragging);
      el.removeEventListener("mouseleave", stopDragging);
      el.removeEventListener("mouseup", stopDragging);
      el.removeEventListener("mousemove", onDrag);
    };
  }, []);

  // arrow scroll
  const scrollLeftFn = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRightFn = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  // using downloaded svg files to display weather icon
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
    <div className="w-full backdrop-blur-md rounded-2xl p-4 mt-1 relative group">
      <h3 className="text-white text-2xl font-bold mb-6 text-center">
        Weather Forecast for your trip
      </h3>

      {/* left arrow */}
      <button
        onClick={scrollLeftFn}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
      >
        ←
      </button>

      {/* right arrow */}
      <button
        onClick={scrollRightFn}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
      >
        →
      </button>

      {/* scrollable container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing mx-10"
      >
        <div className="flex justify-center space-x-4 pb-4 min-w-max mx-auto">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-45 bg-black/20 rounded-xl p-5 text-white text-center hover:bg-black/30 transition-colors duration-300"
            >
              <div className="font-semibold text-sm mb-4">
                {formatDate(day.date)}
              </div>
              <img
                src={getWeatherIcon(day.condition)}
                alt={day.condition}
                className="w-10 h-10 mx-auto mb-2 font-family-opensans"
              />
              <div className="text-s text-gray-200 mb-2 capitalize">
                {day.condition}
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-300">H: {day.maxTemp}°</span>
                <span className="text-blue-300">L: {day.minTemp}°</span>
              </div>
              <div className="text-xs text-cyan-300">💧 {day.rainChance}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* style to hide scrollbar */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default WeatherForecast;





