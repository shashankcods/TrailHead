import React from "react";
import type { Currency } from "@/components/Navbar";
import type { PlannerData } from "@/types/planner";
import WeatherForecast from "@/components/Weather";
import SafetyInfo from "@/components/SafetyInfo";

interface PlannerExtrasProps {
  plannerData: PlannerData;
  selectedCurrency: Currency;
}

const PlannerExtras: React.FC<PlannerExtrasProps> = ({
  plannerData,
  selectedCurrency,
}) => {
  const flights = plannerData.flights?.flights ?? [];
  const hotels = plannerData.hotels?.hotels ?? [];
  const restaurants = plannerData.restaurants ?? [];
  const weatherForecast = plannerData.weather?.forecast ?? [];
  const safety = plannerData.safety;

  const hasAny =
    flights.length > 0 ||
    hotels.length > 0 ||
    restaurants.length > 0 ||
    weatherForecast.length > 0 ||
    !!safety;

  if (!hasAny) return null;

  return (
    <section className="space-y-6">
      <div>
        <h3 className="th-title">Trip Details</h3>
        <p className="th-subtitle mt-1">
          Flights, stays, dining, weather, and safety when available.
        </p>
      </div>

      {flights.length > 0 && (
        <div className="th-soft-card p-5 space-y-3">
          <h4 className="font-bold text-lg">Flights</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {flights.slice(0, 4).map((flight, idx) => {
              const f = flight as Record<string, unknown>;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                >
                  <p className="font-semibold">
                    {String(f.airline ?? "Flight option")}
                  </p>
                  <p className="text-sm text-black/65 dark:text-white/65 mt-1">
                    {String(f.departureAirport ?? "—")} →{" "}
                    {String(f.arrivalAirport ?? "—")}
                  </p>
                  {f.price != null && (
                    <p className="text-sm font-medium mt-2">
                      {selectedCurrency.symbol}
                      {String(f.price)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="th-soft-card p-5 space-y-3">
          <h4 className="font-bold text-lg">Hotels</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {hotels.slice(0, 4).map((hotel, idx) => {
              const h = hotel as Record<string, unknown>;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                >
                  <p className="font-semibold">
                    {String(h.name ?? "Hotel option")}
                  </p>
                  {h.rating != null && (
                    <p className="text-sm mt-1">★ {String(h.rating)}</p>
                  )}
                  {h.parsed_price != null && (
                    <p className="text-sm font-medium mt-1">
                      {selectedCurrency.symbol}
                      {String(h.parsed_price)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="th-soft-card p-5 space-y-3">
          <h4 className="font-bold text-lg">Restaurants</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {restaurants.slice(0, 4).map((item, idx) => {
              const r = item as Record<string, unknown>;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                >
                  <p className="font-semibold">
                    {String(r.name ?? "Restaurant")}
                  </p>
                  {r.rating != null && (
                    <p className="text-sm mt-1">★ {String(r.rating)}</p>
                  )}
                  {r.vicinity != null && (
                    <p className="text-sm text-black/65 dark:text-white/65 mt-1">
                      {String(r.vicinity)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weatherForecast.length > 0 && (
        <div className="th-soft-card p-5">
          <h4 className="font-bold text-lg mb-4">Weather Forecast</h4>
          <WeatherForecast weatherData={weatherForecast} />
        </div>
      )}

      {safety &&
        typeof safety === "object" &&
        "summary" in safety && (
          <div className="th-soft-card p-5">
            <SafetyInfo
              safety={
                safety as {
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
                }
              }
            />
          </div>
        )}
    </section>
  );
};

export default PlannerExtras;
