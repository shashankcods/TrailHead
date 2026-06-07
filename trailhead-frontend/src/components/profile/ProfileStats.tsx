import React from "react";
import {
  CalendarDays,
  MapPin,
  Globe2,
  Bookmark,
  Clock3,
  CheckCircle2,
} from "lucide-react";

interface ProfileStatsProps {
  stats: {
    daysTraveled: number;
    citiesVisited: number;
    countries: number;
    savedTrips: number;
    upcomingTrips: number;
    completedTrips: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statsList = [
    { label: "Days Traveled", value: stats.daysTraveled, icon: CalendarDays },
    { label: "Cities Visited", value: stats.citiesVisited, icon: MapPin },
    { label: "Countries", value: stats.countries, icon: Globe2 },
    { label: "Saved Trips", value: stats.savedTrips, icon: Bookmark },
    { label: "Upcoming Trips", value: stats.upcomingTrips, icon: Clock3 },
    { label: "Completed Trips", value: stats.completedTrips, icon: CheckCircle2 },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
        Your Travel Journey
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statsList.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black/50 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="w-5 h-5 text-black/60 dark:text-white/60" />
                <span className="text-sm text-black/60 dark:text-white/60">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileStats;
