import React, { useState, useRef, useEffect, useCallback } from "react";
import { Calendar } from "./ui/calendar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

type SuggestionItem = {
  label: string;
  city: string;
  country: string;
  placeId: string;
  lat?: number;
  lng?: number;
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

// Cache for suggestions
const suggestionCache = new Map<string, SuggestionItem[]>();

export const TripInputForm: React.FC<TripInputFormProps> = ({
  onSubmit: _onSubmit,
  formId = "trip-input-form",
}) => {
  const [departDate, setDepartDate] = useState<Date | undefined>(undefined);
  const [tripDays, setTripDays] = useState<number>(3);
  const [sourceChoice, setSourceChoice] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState<SuggestionItem[]>([]);
  const [sourceHighlight, setSourceHighlight] = useState<number>(-1);
  const [destinationChoice, setDestinationChoice] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<SuggestionItem[]>([]);
  const [destinationHighlight, setDestinationHighlight] = useState<number>(-1);
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const sourceAbortControllerRef = useRef<AbortController | null>(null);
  const destinationAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeQuery = (query: string) => query.toLowerCase().trim();

  const fetchLocations = async (
    query: string,
    abortController: AbortController
  ): Promise<SuggestionItem[]> => {
    if (!query || query.length < 2) return [];
    const normalizedQuery = normalizeQuery(query);
    if (suggestionCache.has(normalizedQuery)) {
      return suggestionCache.get(normalizedQuery) || [];
    }

    const url = `${API_BASE}/api/maps/autocomplete?query=${encodeURIComponent(query)}`;
    
    try {
      const res = await fetch(url, {
        signal: abortController.signal,
      });
      const responseData = await res.json();
      
      // Extract the suggestions from our APIResponse format
      const suggestions: SuggestionItem[] = responseData.data || [];
      
      suggestionCache.set(normalizedQuery, suggestions);
      return suggestions;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // Ignore aborted requests
        return [];
      }
      console.error("Autocomplete fetch error:", error);
      return [];
    }
  };

  const debounce = (fn: Function, delay: number) => {
    let timer: number;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  const handleSourceChange = useCallback(
    debounce(async (value: string) => {
      // Cancel previous request
      if (sourceAbortControllerRef.current) {
        sourceAbortControllerRef.current.abort();
      }
      const newAbortController = new AbortController();
      sourceAbortControllerRef.current = newAbortController;
      try {
        const results = await fetchLocations(value, newAbortController);
        setSourceSuggestions(results);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Source search error:", error);
        }
      }
    }, 300),
    []
  );

  const handleDestinationChange = useCallback(
    debounce(async (value: string) => {
      // Cancel previous request
      if (destinationAbortControllerRef.current) {
        destinationAbortControllerRef.current.abort();
      }
      const newAbortController = new AbortController();
      destinationAbortControllerRef.current = newAbortController;
      try {
        const results = await fetchLocations(value, newAbortController);
        setDestinationSuggestions(results);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Destination search error:", error);
        }
      }
    }, 300),
    []
  );

  const cleanLocation = (value: string) => {
    if (!value) return "";
    // Handle both "City - Country" and "City, Country" formats
    let cleaned = value;
    // Replace hyphen format with comma format
    if (cleaned.includes(" - ")) {
      cleaned = cleaned.replace(" - ", ", ");
    }
    // Take just the city part
    return cleaned.split(",")[0].trim();
  };
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
    const source = cleanLocation(sourceChoice);
    const destination = cleanLocation(destinationChoice);
    const startDate = departDate ? departDate.toISOString().split("T")[0] : undefined;
    const endDate =
      departDate
        ? new Date(departDate.getTime() + (Math.max(1, tripDays) - 1) * 86400000)
            .toISOString()
            .split("T")[0]
        : undefined;

    _onSubmit({
      source,
      destination,
      startDate,
      endDate,
      travelers: travelersCount,
      activities: selectedActivities,
    });
    setSourceSuggestions([]);
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
            <h3 className="th-title">Where are you traveling from?</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search departure city..."
                value={sourceChoice}
                onChange={(e) => {
                  setSourceChoice(e.target.value);
                  handleSourceChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (sourceSuggestions.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSourceHighlight((prev) => (prev + 1) % sourceSuggestions.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSourceHighlight((prev) =>
                      prev <= 0 ? sourceSuggestions.length - 1 : prev - 1
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (sourceHighlight >= 0) {
                      // Use just the city name for the input
                      setSourceChoice(sourceSuggestions[sourceHighlight].city);
                      setSourceSuggestions([]);
                      setSourceHighlight(-1);
                    }
                  } else if (e.key === "Escape") {
                    setSourceSuggestions([]);
                    setSourceHighlight(-1);
                  }
                }}
                className="th-input"
              />
              {sourceSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-black mt-1 rounded-md max-h-40 overflow-y-auto z-50 border border-black/20 dark:border-white/20">
                  {sourceSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        // Use just the city name for the input
                        setSourceChoice(item.city);
                        setSourceSuggestions([]);
                        setSourceHighlight(-1);
                      }}
                      className={`px-3 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer ${
                        idx === sourceHighlight
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : ""
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/15" />

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
                      // Use just the city name for the input
                      setDestinationChoice(destinationSuggestions[destinationHighlight].city);
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
                        // Use just the city name for the input
                        setDestinationChoice(item.city);
                        setDestinationSuggestions([]);
                        setDestinationHighlight(-1);
                      }}
                      className={`px-3 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer ${
                        idx === destinationHighlight
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : ""
                      }`}
                    >
                      {item.label}
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

