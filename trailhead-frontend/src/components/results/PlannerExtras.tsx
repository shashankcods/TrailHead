import React, { useState } from "react";
import type { Currency } from "@/components/Navbar";
import type { PlannerData } from "@/types/planner";
import WeatherForecast from "@/components/Weather";
import SafetyInfo from "@/components/SafetyInfo";

interface PlannerExtrasProps {
  plannerData: PlannerData;
  selectedCurrency: Currency;
}

const getListFromPayload = (
  payload:
    | Record<string, unknown>[]
    | { restaurants?: Record<string, unknown>[]; events?: Record<string, unknown>[] }
    | null
    | undefined,
  key: "restaurants" | "events"
): Record<string, unknown>[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const list = payload[key];
  return Array.isArray(list) ? list : [];
};

const PlannerExtras: React.FC<PlannerExtrasProps> = ({
  plannerData,
  selectedCurrency,
}) => {
  const flights = plannerData.flights?.flights ?? [];
  const hotels = plannerData.hotels?.hotels ?? [];
  const restaurants = getListFromPayload(plannerData.restaurants, "restaurants");
  const events = getListFromPayload(plannerData.events, "events");
  const weatherForecast = plannerData.weather?.forecast ?? [];
  const safety = plannerData.safety;
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="th-title">Trip Details</h3>
        <p className="th-subtitle mt-1">
          Flights, stays, dining, weather, and safety when available.
        </p>
      </div>

      {[
        "weather",
        "safety",
        "flights",
        "hotels",
        "restaurants",
        "events",
      ].map((section) => {
        const isOpen = openSection === section;
        const titleMap: Record<string, string> = {
          weather: "Weather Forecast",
          safety: "Safety Info",
          flights: "Flights",
          hotels: "Hotels",
          restaurants: "Restaurants",
          events: "Events",
        };

        return (
          <div key={section} className="th-soft-card overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left border-b border-black/10 dark:border-white/10"
            >
              <span className="font-bold">{titleMap[section]}</span>
              <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                {isOpen ? "Hide" : "Show"}
              </span>
            </button>

            {isOpen && (
              <div className="p-5">
                {section === "weather" &&
                  (weatherForecast.length > 0 ? (
                    <WeatherForecast weatherData={weatherForecast} />
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Weather forecast is unavailable for this trip.
                    </p>
                  ))}

                {section === "safety" &&
                  (safety && typeof safety === "object" && "summary" in safety ? (
                    <SafetyInfo
                      safety={
                        safety as {
                          destination: string;
                          country: string;
                          summary: string;
                          citySafety: { crimeIndex: number; safetyIndex: number };
                          localSafety: {
                            radiusKm: number;
                            hospitals: number;
                            policeStations: number;
                            fireStations: number;
                          };
                        }
                      }
                    />
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Safety information is unavailable for this trip.
                    </p>
                  ))}

                {section === "flights" &&
                  (flights.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {flights.slice(0, 4).map((flight, idx) => {
                        const f = flight as Record<string, unknown>;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                          >
                            <p className="font-semibold">{String(f.airline ?? "Flight option")}</p>
                            <p className="text-sm text-black/65 dark:text-white/65 mt-1">
                              {String(f.departureAirport ?? "—")} → {String(f.arrivalAirport ?? "—")}
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
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Flight information is unavailable for this trip.
                    </p>
                  ))}

                {section === "hotels" &&
                  (hotels.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {hotels.slice(0, 4).map((hotel, idx) => {
                        const h = hotel as Record<string, unknown>;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                          >
                            <p className="font-semibold">{String(h.name ?? "Hotel option")}</p>
                            {h.rating != null && <p className="text-sm mt-1">★ {String(h.rating)}</p>}
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
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Hotel information is unavailable for this trip.
                    </p>
                  ))}

                {section === "restaurants" &&
                  (restaurants.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {restaurants.slice(0, 4).map((item, idx) => {
                        const r = item as Record<string, unknown>;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                          >
                            <p className="font-semibold">{String(r.name ?? "Restaurant")}</p>
                            {r.rating != null && <p className="text-sm mt-1">★ {String(r.rating)}</p>}
                            {r.vicinity != null && (
                              <p className="text-sm text-black/65 dark:text-white/65 mt-1">
                                {String(r.vicinity)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Restaurant suggestions are unavailable for this trip.
                    </p>
                  ))}

                {section === "events" &&
                  (events.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {events.slice(0, 4).map((event, idx) => {
                        const e = event as Record<string, unknown>;
                        const eventDate =
                          typeof e.date === "string" || typeof e.date === "number"
                            ? String(e.date)
                            : undefined;
                        const venue =
                          typeof e.venue === "string" || typeof e.venue === "number"
                            ? String(e.venue)
                            : undefined;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/40"
                          >
                            <p className="font-semibold">{String(e.name ?? "Event")}</p>
                            {eventDate && (
                              <p className="text-sm mt-1 text-black/65 dark:text-white/65">
                                {eventDate}
                              </p>
                            )}
                            {venue && (
                              <p className="text-sm mt-1 text-black/65 dark:text-white/65">
                                {venue}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Event data is unavailable for this trip.
                    </p>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default PlannerExtras;
