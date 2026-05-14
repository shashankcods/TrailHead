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
  if (!safety) return <div className="text-black/70 dark:text-white/70">Safety info not available.</div>;

  const {
    destination = "N/A",
    country = "N/A",
    summary = "Safety info not available.",
    citySafety = { crimeIndex: 0, safetyIndex: 0 },
    localSafety = { radiusKm: 0, hospitals: 0, policeStations: 0, fireStations: 0 },
  } = safety;


  return (
    <div className="w-full bg-transparentp-6 rounded-2xl shadow-lg flex flex-col">
      <h2 className="text-2xl font-semibold text-center mb-6">
        🛡️ Safety Overview of {destination}, {country}
      </h2>

      <div className="flex flex-col lg:flex-row justify-around gap-6 items-center w-full">
        {/* city safety */}
        <div className="flex-1 bg-gradient-to-br from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 rounded-xl shadow p-5 flex flex-col items-center text-center border border-black/20 dark:border-white/20">
          <h3 className="text-lg font-medium text-black dark:text-white mb-3">
            City Safety Index
          </h3>
          <div className="flex gap-10">
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Crime Index</p>
              <p className="text-2xl font-semibold">
                {citySafety.crimeIndex}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Safety Index</p>
              <p className="text-2xl font-semibold">
                {citySafety.safetyIndex}
              </p>
            </div>
          </div>
        </div>

        {/* local safety- */}
        <div className="flex-1 bg-gradient-to-br from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 rounded-xl shadow p-5 flex flex-col items-center text-center border border-black/20 dark:border-white/20">
          <h3 className="text-lg font-medium text-black dark:text-white mb-3">
            Local Safety (within {localSafety.radiusKm} km)
          </h3>
          <div className="flex gap-10">
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Hospitals</p>
              <p className="text-2xl font-semibold">
                {localSafety.hospitals}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Police Stations</p>
              <p className="text-2xl font-semibold">
                {localSafety.policeStations}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Fire Stations</p>
              <p className="text-2xl font-semibold">
                {localSafety.fireStations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* summary */}
      <div className="mt-1 text-center bg-transparent rounded-lg p-4 text-shadow-indigo-100">
        <p className="italic">{summary}</p>
      </div>
    </div>
  );
};

export default SafetyInfo;
