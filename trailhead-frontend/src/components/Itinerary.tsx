import React from "react";

export interface ItineraryDay {
  day: number;
  date: string;
  points: string[];
}

interface ItineraryProps {
  itinerary: ItineraryDay[];
}

const Itinerary: React.FC<ItineraryProps> = ({ itinerary }) => {
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
        Trip Itinerary
      </h3>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2">
        {itinerary.map((day, index) => (
          <div
            key={index}
            className="flex-shrink-0
              bg-gradient-to-br from-black/80 via-black/20 to-transparent
              backdrop-blur-2xl
              border border-white/20
              rounded-xl p-5 text-white
              hover:bg-white/5
              transition-all duration-300
              w-80
            "
          >
            <div className="font-bold text-lg mb-1">
              Day {day.day} - {formatDate(day.date)}
            </div>

            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-2">
              {day.points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
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

export default Itinerary;
