import React, { useState } from "react";
import type { PlannerData } from "@/types/planner";
import WeatherForecast from "@/components/Weather";
import SafetyInfo from "@/components/SafetyInfo";
import { MapPin, Star, ExternalLink, Ticket, Calendar, Clock } from "lucide-react";

interface PlannerExtrasProps {
  plannerData: PlannerData;
}

type Restaurant = {
  placeId?: string;
  name?: string;
  address?: string;
  rating?: number | string;
  totalReviews?: number;
  priceLevel?: string;
  cuisine?: string[];
  description?: string;
  photoUrl?: string;
  website?: string;
  googleMapsUrl?: string;
};

type Event = {
  title?: string;
  category?: string;
  start?: string;
  localDate?: string;
  localTime?: string;
  end?: string;
  venue?: string;
  city?: string;
  country?: string;
  image?: string;
  status?: string;
  ticketUrl?: string;
};

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

const formatEventDate = (localDate?: string, isoFallback?: string) => {
  if (localDate) {
    try {
      // Parse as local date to avoid timezone shift
      const [year, month, day] = localDate.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return localDate;
    }
  }
  if (!isoFallback) return null;
  try {
    return new Date(isoFallback).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoFallback;
  }
};

const formatEventTime = (localTime?: string) => {
  if (!localTime) return null;
  try {
    const [h, m] = localTime.split(":").map(Number);
    const d = new Date(2000, 0, 1, h, m);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return localTime;
  }
};

const RestaurantCard: React.FC<{ r: Restaurant }> = ({ r }) => (
  <div className="flex-shrink-0 w-64 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 overflow-hidden flex flex-col">
    {r.photoUrl ? (
      <img
        src={r.photoUrl}
        alt={r.name ?? "Restaurant"}
        className="w-full h-36 object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    ) : (
      <div className="w-full h-36 bg-black/5 dark:bg-white/5 flex items-center justify-center">
        <span className="text-2xl opacity-30">🍽️</span>
      </div>
    )}

    <div className="p-4 flex flex-col gap-2 flex-1">
      <div>
        <p className="font-bold text-sm leading-tight line-clamp-2">{r.name ?? "Restaurant"}</p>
        {r.description && (
          <p className="text-xs text-black/55 dark:text-white/55 mt-1 line-clamp-2">{r.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {r.rating != null && (
          <span className="flex items-center gap-1 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            {r.rating}
            {r.totalReviews ? (
              <span className="font-normal text-black/50 dark:text-white/50">
                ({r.totalReviews.toLocaleString()})
              </span>
            ) : null}
          </span>
        )}
        {r.priceLevel && (
          <span className="text-xs font-semibold rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5">
            {r.priceLevel}
          </span>
        )}
      </div>

      {r.cuisine && r.cuisine.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {r.cuisine.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-[10px] font-semibold rounded-full bg-black/[0.05] dark:bg-white/[0.07] px-2 py-0.5 capitalize"
            >
              {c.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {r.address && (
        <p className="flex items-start gap-1 text-xs text-black/55 dark:text-white/55 leading-snug">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{r.address}</span>
        </p>
      )}

      <div className="flex gap-2 mt-auto pt-2">
        {r.googleMapsUrl && (
          <a
            href={r.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 text-xs font-semibold hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
          >
            <MapPin className="w-3 h-3" />
            Maps
          </a>
        )}
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-3 py-2 text-xs font-semibold hover:opacity-90 transition"
          >
            <ExternalLink className="w-3 h-3" />
            Website
          </a>
        )}
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ e: Event }> = ({ e }) => {
  const date = formatEventDate(e.localDate, e.start);
  const time = formatEventTime(e.localTime);

  return (
    <div className="flex-shrink-0 w-64 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 overflow-hidden flex flex-col">
      {e.image ? (
        <img
          src={e.image}
          alt={e.title ?? "Event"}
          className="w-full h-36 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-36 bg-black/5 dark:bg-white/5 flex items-center justify-center">
          <span className="text-2xl opacity-30">🎟️</span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          {e.category && (
            <span className="text-[10px] font-semibold rounded-full bg-black/[0.05] dark:bg-white/[0.07] px-2 py-0.5 capitalize">
              {e.category}
            </span>
          )}
          <p className="font-bold text-sm leading-tight mt-1.5 line-clamp-2">{e.title ?? "Event"}</p>
        </div>

        {(date || time) && (
          <div className="space-y-1">
            {date && (
              <p className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
                <Calendar className="w-3 h-3 shrink-0" />
                {date}
              </p>
            )}
            {time && (
              <p className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
                <Clock className="w-3 h-3 shrink-0" />
                {time}
              </p>
            )}
          </div>
        )}

        {e.venue && (
          <p className="flex items-start gap-1 text-xs text-black/55 dark:text-white/55 leading-snug">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{e.venue}</span>
          </p>
        )}

        {e.status && e.status !== "unknown" && (
          <span
            className={`self-start text-[10px] font-semibold rounded-full px-2 py-0.5 ${
              e.status === "onsale"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-black/[0.05] dark:bg-white/[0.07] text-black/60 dark:text-white/60"
            }`}
          >
            {e.status === "onsale" ? "On sale" : e.status}
          </span>
        )}

        {e.ticketUrl && (
          <a
            href={e.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-3 py-2 text-xs font-semibold hover:opacity-90 transition"
          >
            <Ticket className="w-3 h-3" />
            Get Tickets
          </a>
        )}
      </div>
    </div>
  );
};

const PlannerExtras: React.FC<PlannerExtrasProps> = ({ plannerData }) => {
  const restaurants = getListFromPayload(plannerData.restaurants, "restaurants") as Restaurant[];
  const events = getListFromPayload(plannerData.events, "events") as Event[];
  const weatherForecast = plannerData.weather?.forecast ?? [];
  const safety = plannerData.safety;
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const sections = [
    { id: "weather", label: "Weather Forecast", count: weatherForecast.length },
    { id: "safety", label: "Safety Info", count: null },
    { id: "restaurants", label: "Restaurants", count: restaurants.length },
    { id: "events", label: "Events", count: events.length },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h3 className="th-title">Know before you go</h3>
        <p className="th-subtitle mt-1">
          Weather, safety, dining, and events when available.
        </p>
      </div>

      {sections.map(({ id, label, count }) => {
        const isOpen = openSection === id;

        return (
          <div key={id} className="th-soft-card overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(id)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left border-b border-black/10 dark:border-white/10"
            >
              <span className="font-bold flex items-center gap-2">
                {label}
                {count != null && count > 0 && (
                  <span className="text-xs font-semibold rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-black/60 dark:text-white/60">
                    {count}
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                {isOpen ? "Hide" : "Show"}
              </span>
            </button>

            {isOpen && (
              <div className="p-5">
                {id === "weather" &&
                  (weatherForecast.length > 0 ? (
                    <WeatherForecast weatherData={weatherForecast} />
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Weather forecast is unavailable for this trip.
                    </p>
                  ))}

                {id === "safety" &&
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

                {id === "restaurants" &&
                  (restaurants.length > 0 ? (
                    <div className="overflow-x-auto -mx-1 px-1">
                      <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
                        {restaurants.map((r, idx) => (
                          <RestaurantCard key={r.placeId ?? idx} r={r} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Restaurant suggestions are unavailable for this trip.
                    </p>
                  ))}

                {id === "events" &&
                  (events.length > 0 ? (
                    <div className="overflow-x-auto -mx-1 px-1">
                      <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
                        {events.map((e, idx) => (
                          <EventCard key={e.ticketUrl ?? idx} e={e} />
                        ))}
                      </div>
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
