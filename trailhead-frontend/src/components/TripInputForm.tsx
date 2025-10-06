import React, { useState, useRef, useEffect, useCallback } from "react";
import { Calendar } from "./ui/calendar";
import type { DateRange } from "react-day-picker";

interface TripInputFormProps {
  onSubmit: (data: {
    source: string;
    destination: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => void;
}

export const TripInputForm: React.FC<TripInputFormProps> = ({ onSubmit }) => {
  // input states
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // states req. for calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [picking, setPicking] = useState<"from" | "to" | undefined>(undefined);
  const rangeRef = useRef<HTMLDivElement>(null);

  // suggestion states
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    string[]
  >([]);

  // for keyboard navigation through search results
  const [sourceHighlight, setSourceHighlight] = useState<number>(-1);
  const [destinationHighlight, setDestinationHighlight] = useState<number>(-1);

  // to close calendar on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rangeRef.current &&
        !rangeRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fetching locations from OSM nomatim and filtering
  const fetchLocations = async (query: string) => {
    if (!query) return [];

    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=10`;

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "TripPlannerApp",
      },
    });

    const data = await res.json();
    const resultsSet = new Set<string>();

    data.forEach((item: any) => {
      const city =
        item.address.city || item.address.town || item.address.village;
      const country = item.address.country;
      if (city && country) {
        resultsSet.add(`${city}, ${country}`);
      }
    });

    return Array.from(resultsSet);
  };

  // debounce
  const debounce = (fn: Function, delay: number) => {
    let timer: number;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  // handling source suggestions
  const handleSourceChange = useCallback(
    debounce(async (value: string) => {
      const results = await fetchLocations(value);
      setSourceSuggestions(results);
    }, 500),
    []
  );

  // handling dest suggestions
  const handleDestinationChange = useCallback(
    debounce(async (value: string) => {
      const results = await fetchLocations(value);
      setDestinationSuggestions(results);
    }, 500),
    []
  );

  // form submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      source,
      destination,
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    });
    setSourceSuggestions([]);
    setDestinationSuggestions([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap justify-center items-center gap-6 w-full max-w-6xl bg-black/20 backdrop-blur-md p-6 rounded-2xl shadow-lg relative"
    >
      {/* source input */}
      <div className="w-[200px] relative">
        <input
          type="text"
          placeholder="From"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            handleSourceChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (sourceSuggestions.length === 0) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSourceHighlight(
                (prev) => (prev + 1) % sourceSuggestions.length
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSourceHighlight((prev) =>
                prev <= 0 ? sourceSuggestions.length - 1 : prev - 1
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (sourceHighlight >= 0) {
                setSource(sourceSuggestions[sourceHighlight]);
                setSourceSuggestions([]);
                setSourceHighlight(-1);
              }
            } else if (e.key === "Escape") {
              setSourceSuggestions([]);
              setSourceHighlight(-1);
            }
          }}
          className="flex-1 p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
        {sourceSuggestions.length > 0 && (
          <div className="absolute bg-black/80 w-full mt-1 rounded-md max-h-40 overflow-y-auto z-50">
            {sourceSuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSource(item);
                  setSourceSuggestions([]);
                  setSourceHighlight(-1);
                }}
                className={`px-3 py-2 hover:bg-gray-700 cursor-pointer ${
                  idx === sourceHighlight ? "bg-gray-900" : ""
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* destination input */}
      <div className="w-[200px] relative">
        <input
          type="text"
          placeholder="To"
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            handleDestinationChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (destinationSuggestions.length === 0) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setDestinationHighlight(
                (prev) => (prev + 1) % destinationSuggestions.length
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setDestinationHighlight((prev) =>
                prev <= 0 ? destinationSuggestions.length - 1 : prev - 1
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (destinationHighlight >= 0) {
                setDestination(destinationSuggestions[destinationHighlight]);
                setDestinationSuggestions([]);
                setDestinationHighlight(-1);
              }
            } else if (e.key === "Escape") {
              setDestinationSuggestions([]);
              setDestinationHighlight(-1);
            }
          }}
          className="flex-1 p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
        {destinationSuggestions.length > 0 && (
          <div className="absolute bg-black/80 w-full mt-1 rounded-md max-h-40 overflow-y-auto z-50">
            {destinationSuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDestination(item);
                  setDestinationSuggestions([]);
                  setDestinationHighlight(-1);
                }}
                className={`px-3 py-2 hover:bg-gray-700 cursor-pointer ${
                  idx === destinationHighlight ? "bg-gray-700" : ""
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* depart/return calendar */}
      <div ref={rangeRef} className="w-[400px] relative">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Depart"
            value={dateRange?.from ? dateRange.from.toLocaleDateString() : ""}
            readOnly
            onClick={() => {
              setPicking("from");
              setShowCalendar(true);
            }}
            className="flex-1 p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          />
          <input
            type="text"
            placeholder="Return"
            value={dateRange?.to ? dateRange.to.toLocaleDateString() : ""}
            readOnly
            onClick={() => {
              setPicking("to");
              setShowCalendar(true);
            }}
            className="flex-1 p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          />
        </div>
        {showCalendar && (
          <div className="absolute top-full mt-4 z-50">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onDayClick={(day) => {
                setDateRange((prev) => {
                  const current = prev ?? { from: undefined, to: undefined };
                  let next: DateRange = { from: current.from, to: current.to };

                  if (picking === "from") {
                    if (current.to && day > current.to) {
                      next = { from: day, to: undefined };
                    } else {
                      next = { from: day, to: current.to };
                    }
                    if (!next.to) setPicking("to");
                  } else if (picking === "to") {
                    if (current.from && day < current.from) {
                      next = { from: day, to: current.from };
                    } else {
                      next = { from: current.from ?? day, to: day };
                    }
                  } else {
                    if (!current.from || (current.from && current.to)) {
                      next = { from: day, to: undefined };
                      setPicking("to");
                    } else if (current.from && !current.to) {
                      if (day < current.from) {
                        next = { from: day, to: current.from };
                      } else {
                        next = { from: current.from, to: day };
                      }
                    }
                  }

                  if (next.from && next.to) {
                    setShowCalendar(false);
                    setPicking(undefined);
                  }
                  return next;
                });
              }}
              defaultMonth={dateRange?.from ?? dateRange?.to ?? new Date()}
              className="rounded-lg border bg-black/20 backdrop-blur-sm"
              classNames={{
                today:
                  "border border-white text-white bg-transparent font-semibold rounded-lg",
              }}
            />
          </div>
        )}
      </div>

      {/* plan my trip button */}
      <div className="w-[200px] flex justify-center">
        <button
          type="submit"
          className="bg-white text-[#3A1C71] font-semibold ml-6 py-3 px-10 rounded-lg hover:scale-105 hover:bg-gray-100 transition duration-300 w-full"
        >
          Plan My Trip
        </button>
      </div>
    </form>
  );
};
