import React, { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("clear")) return "/weather/clear.svg";
    if (c.includes("partly")) return "/weather/partly-cloudy.svg";
    if (c.includes("cloud")) return "/weather/cloudy.svg";
    if (c.includes("fog") || c.includes("rime")) return "/weather/frog.svg";
    if (c.includes("drizzle")) return "/weather/drizzle.svg";
    if (c.includes("rain") || c.includes("showers")) return "/weather/rain.svg";
    if (c.includes("snow")) return "/weather/snow.svg";
    if (c.includes("thunder")) return "/weather/thunder.svg";
    return "/weather/clear.svg";
  };

  const formatDayParts = (dateString: string) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      monthDay: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.classList.add("cursor-grabbing");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.classList.remove("cursor-grabbing");
    };

    const handleMouseUp = () => {
      isDown = false;
      container.classList.remove("cursor-grabbing");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full text-center">
      <div
        ref={containerRef}
        className="flex w-full gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide cursor-grab select-none py-1"
      >
        {weatherData.map((day, index) => {
          const { weekday, monthDay } = formatDayParts(day.date);

          return (
            <div
              key={index}
              title={day.condition}
              style={{ animationDelay: `${index * 55}ms` }}
              className="weather-day-card flex-1 basis-0 min-w-[4.75rem] snap-start
                rounded-xl border border-black/10 dark:border-white/15
                bg-white/60 dark:bg-black/40
                px-2 py-2.5
                flex flex-col items-center justify-center gap-1
                text-black dark:text-white text-center
                hover:scale-[1.03] hover:border-black/20 dark:hover:border-white/25
                hover:bg-white/85 dark:hover:bg-black/55
                hover:shadow-sm
                transition-all duration-300 ease-out"
            >
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
                  {weekday}
                </p>
                <p className="text-xs font-bold">{monthDay}</p>
              </div>

              <img
                src={getWeatherIcon(day.condition)}
                alt={day.condition}
                className="w-8 h-8 object-contain my-0.5"
                draggable={false}
              />

              <p className="text-[10px] leading-tight text-black/60 dark:text-white/60 capitalize truncate w-full px-0.5">
                {day.condition}
              </p>

              <div className="flex items-baseline justify-center gap-1 text-xs font-semibold">
                <span>{day.maxTemp}°</span>
                <span className="text-black/45 dark:text-white/45 font-normal">
                  {day.minTemp}°
                </span>
              </div>

              <p className="text-[10px] text-black/55 dark:text-white/55">
                💧 {day.rainAmount}mm
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes weatherFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .weather-day-card {
          animation: weatherFadeIn 0.45s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default WeatherForecast;
