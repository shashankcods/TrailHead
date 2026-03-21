import React, { useState, useRef, useEffect, useCallback } from "react";
import { Calendar } from "./ui/calendar";

interface TripInputFormProps {
  onSubmit: (data: {
    source: string;
    destination: string;
    startDate: string | undefined;
    endDate: string | undefined;
    travelers: number;
    activities: string[];
  }) => void;
  formId?: string;
}

type ActivityType = {
  id: string;
  title: string;
  description: string;
};

const activities: ActivityType[] = [
  { id: "beaches", title: "Beaches", description: "Coastal relaxation and water views" },
  { id: "city-sightseeing", title: "City Sightseeing", description: "Landmarks and urban highlights" },
  { id: "outdoor-adventures", title: "Outdoor Adventures", description: "Nature trails and adrenaline activities" },
  { id: "festivals-events", title: "Festivals/Events", description: "Concerts, events, and local celebrations" },
  { id: "food-exploration", title: "Food Exploration", description: "Local cuisine and dining experiences" },
  { id: "nightlife", title: "Nightlife", description: "Bars, clubs, and evening experiences" },
  { id: "shopping", title: "Shopping", description: "Markets, malls, and local finds" },
  { id: "spa-wellness", title: "Spa Wellness", description: "Relaxation, wellness, and recovery" },
];

export const TripInputForm: React.FC<TripInputFormProps> = ({
  onSubmit: _onSubmit,
  formId = "trip-input-form",
}) => {
  const [departDate, setDepartDate] = useState<Date | undefined>(undefined);
  const [tripDays, setTripDays] = useState<number>(3);
  const [destinationChoice, setDestinationChoice] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [destinationHighlight, setDestinationHighlight] = useState<number>(-1);
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocations = async (query: string) => {
    if (!query) return [];
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=10`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "TrailHead" },
    });
    const data = await res.json();
    const resultsSet = new Set<string>();
    data.forEach((item: any) => {
      const city = item.address.city || item.address.town || item.address.village;
      const country = item.address.country;
      if (city && country) resultsSet.add(`${city}, ${country}`);
    });
    return Array.from(resultsSet);
  };

  const debounce = (fn: Function, delay: number) => {
    let timer: number;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  const handleDestinationChange = useCallback(
    debounce(async (value: string) => {
      const results = await fetchLocations(value);
      setDestinationSuggestions(results);
    }, 400),
    []
  );

  const cleanLocation = (value: string) => (value ? value.split(",")[0].trim() : "");
  const formatDisplayDate = (date: Date | undefined) =>
    date
      ? date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destination = cleanLocation(destinationChoice);
    const startDate = departDate ? departDate.toISOString().split("T")[0] : undefined;
    const endDate =
      departDate
        ? new Date(departDate.getTime() + (Math.max(1, tripDays) - 1) * 86400000)
            .toISOString()
            .split("T")[0]
        : undefined;

    _onSubmit({
      source: "Not specified",
      destination,
      startDate,
      endDate,
      travelers: travelersCount,
      activities: selectedActivities,
    });
    setDestinationSuggestions([]);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4">
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="w-full th-soft-card backdrop-blur-md p-7"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="th-title">What is destination of choice?</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                value={destinationChoice}
                onChange={(e) => {
                  setDestinationChoice(e.target.value);
                  handleDestinationChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (destinationSuggestions.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setDestinationHighlight((prev) => (prev + 1) % destinationSuggestions.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setDestinationHighlight((prev) =>
                      prev <= 0 ? destinationSuggestions.length - 1 : prev - 1
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (destinationHighlight >= 0) {
                      setDestinationChoice(destinationSuggestions[destinationHighlight]);
                      setDestinationSuggestions([]);
                      setDestinationHighlight(-1);
                    }
                  } else if (e.key === "Escape") {
                    setDestinationSuggestions([]);
                    setDestinationHighlight(-1);
                  }
                }}
                className="th-input"
              />
              {destinationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-black mt-1 rounded-md max-h-40 overflow-y-auto z-50 border border-black/20 dark:border-white/20">
                  {destinationSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setDestinationChoice(item);
                        setDestinationSuggestions([]);
                        setDestinationHighlight(-1);
                      }}
                      className={`px-3 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer ${
                        idx === destinationHighlight
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : ""
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/15" />

          <div className="space-y-3" ref={dateRef}>
            <h3 className="th-title">When are you planning to travel?</h3>
            <input
              type="text"
              placeholder="Select Date..."
              value={formatDisplayDate(departDate)}
              readOnly
              onClick={() => setShowCalendar(true)}
              className="th-input cursor-pointer"
            />
            {showCalendar && (
              <div className="relative mt-2 z-40">
                <Calendar
                  mode="single"
                  numberOfMonths={2}
                  selected={departDate}
                  disabled={{ before: new Date() }}
                  onSelect={(day) => {
                    setDepartDate(day);
                    setShowCalendar(false);
                  }}
                  defaultMonth={departDate ?? new Date()}
                  className="rounded-lg border border-black/20 dark:border-white/25 bg-white dark:bg-black"
                  classNames={{
                    today:
                      "border border-black dark:border-white text-black dark:text-white font-semibold rounded-lg",
                  }}
                />
              </div>
            )}
          </div>

          <div className="border-t border-black/10 dark:border-white/15" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="th-title">How many days are you planning to travel?</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTripDays((prev) => Math.max(1, prev - 1))}
                  className="h-10 w-10 rounded-full border border-black/20 dark:border-white/25 bg-white dark:bg-black text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-semibold min-w-8 text-center">{tripDays}</span>
                <button
                  type="button"
                  onClick={() => setTripDays((prev) => prev + 1)}
                  className="h-10 w-10 rounded-full border border-black/20 dark:border-white/25 bg-white dark:bg-black text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="w-full th-soft-card backdrop-blur-md p-6">
        <div className="mb-4">
          <h3 className="th-title text-black dark:text-white">
            Number of Travelers
          </h3>
          <p className="th-subtitle">
            How many people are traveling?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTravelersCount((prev) => Math.max(1, prev - 1))}
            className="h-12 w-16 rounded-lg border border-black/20 dark:border-white/25 bg-white dark:bg-black text-black dark:text-white text-2xl"
          >
            -
          </button>
          <div className="h-12 flex-1 rounded-lg border border-black/20 dark:border-white/25 bg-white dark:bg-black text-black dark:text-white text-3xl font-bold flex items-center justify-center">
            {travelersCount}
          </div>
          <button
            type="button"
            onClick={() => setTravelersCount((prev) => prev + 1)}
            className="h-12 w-16 rounded-lg border border-black/20 dark:border-white/25 bg-white dark:bg-black text-black dark:text-white text-2xl"
          >
            +
          </button>
        </div>

        <p className="mt-4 th-subtitle text-base">
          {travelersCount === 1 ? "Solo traveler" : `${travelersCount} travelers`}
        </p>
      </div>

      <div className="w-full th-soft-card backdrop-blur-md p-6">
        <div className="mb-4">
          <h3 className="th-title text-black dark:text-white">
            Which activities are you interested in?
          </h3>
          <p className="th-subtitle">
            Select one or more options to personalize your plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activities.map((activity) => {
            const isSelected = selectedActivities.includes(activity.id);
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => toggleActivity(activity.id)}
                className={`text-left rounded-xl border p-4 transition-colors ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <div className="font-semibold text-lg">{activity.title}</div>
                <div
                  className={`text-sm mt-1 ${
                    isSelected ? "text-white/80 dark:text-black/80" : "text-black/70 dark:text-white/70"
                  }`}
                >
                  {activity.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

