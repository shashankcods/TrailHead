import React from "react";

interface SafetyProps {
  safety: {
    destination: string;
    country: string;
    summary: string;
    citySafety: {
      crimeIndex: number;
      safetyIndex: number;
    };
    localSafety: {
      radiusKm: number;
      hospitals: number;
      policeStations: number;
      fireStations: number;
    };
  };
}

const SafetyInfo: React.FC<SafetyProps> = ({ safety }) => {
  if (!safety) {
    return (
      <p className="text-sm text-center text-black/60 dark:text-white/60">
        Safety info not available.
      </p>
    );
  }

  const {
    destination = "N/A",
    country = "N/A",
    summary = "Safety info not available.",
    citySafety = { crimeIndex: 0, safetyIndex: 0 },
    localSafety = { radiusKm: 0, hospitals: 0, policeStations: 0, fireStations: 0 },
  } = safety;

  const stats = [
    {
      label: "Crime Index",
      value: citySafety.crimeIndex.toFixed(1),
      hint: "City",
    },
    {
      label: "Safety Index",
      value: citySafety.safetyIndex.toFixed(1),
      hint: "City",
    },
    {
      label: "Hospitals",
      value: String(localSafety.hospitals),
      hint: `${localSafety.radiusKm} km`,
    },
    {
      label: "Police",
      value: String(localSafety.policeStations),
      hint: `${localSafety.radiusKm} km`,
    },
    {
      label: "Fire Stations",
      value: String(localSafety.fireStations),
      hint: `${localSafety.radiusKm} km`,
    },
  ];

  return (
    <div className="w-full space-y-3 text-center">
      <p className="text-xs font-semibold text-black/55 dark:text-white/55">
        {destination}, {country}
      </p>

      <div className="grid w-full grid-cols-5 gap-2">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${index * 55}ms` }}
            className="safety-stat-card
              rounded-xl border border-black/10 dark:border-white/15
              bg-white/60 dark:bg-black/40
              px-2 py-2.5
              flex flex-col items-center justify-center gap-0.5 text-center
              text-black dark:text-white
              hover:scale-[1.03] hover:border-black/20 dark:hover:border-white/25
              hover:bg-white/85 dark:hover:bg-black/55
              hover:shadow-sm
              transition-all duration-300 ease-out"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 leading-tight">
              {stat.label}
            </p>
            <p className="text-base font-bold leading-none">{stat.value}</p>
            <p className="text-[10px] text-black/45 dark:text-white/45">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-black/60 dark:text-white/60 max-w-3xl mx-auto">
        {summary}
      </p>

      <style>{`
        @keyframes safetyFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .safety-stat-card {
          animation: safetyFadeIn 0.45s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default SafetyInfo;
