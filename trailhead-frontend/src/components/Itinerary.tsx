import React, { useRef, useEffect } from "react";

export interface ItineraryDay {
  day: number;
  date: string;
  points: string[];
}

interface ItineraryProps {
  itinerary: ItineraryDay[];
}

const Itinerary: React.FC<ItineraryProps> = ({ itinerary }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

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
    <div className="w-full mt-4 mb-10 p-4 relative">
      <h3 className="text-black dark:text-white text-2xl font-bold mb-6 text-center">
        Trip Itinerary
      </h3>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab select-none px-4"
      >
        {itinerary.map((day, index) => (
          <div
            key={index}
            className="flex-shrink-0
              bg-gradient-to-br from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5
              backdrop-blur-2xl
              border border-black/20 dark:border-white/20
              rounded-xl p-5 text-black dark:text-white
              hover:bg-black/10 dark:hover:bg-white/20
              transition-all duration-300
              w-80
            "
          >
            <div className="font-bold text-lg mb-1">
              Day {day.day} - {formatDate(day.date)}
            </div>

            <ul className="list-disc list-inside text-sm text-black/80 dark:text-white/80 space-y-1 mt-2">
              {day.points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

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

export default Itinerary;




