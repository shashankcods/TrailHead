import React, { useState, useRef, useEffect } from "react"
import { Calendar } from "./ui/calendar"
import type { DateRange } from "react-day-picker"

interface TripInputFormProps {
  onSubmit: (data: {
    source: string
    destination: string
    startDate: Date | undefined
    endDate: Date | undefined
  }) => void
}

export const TripInputForm: React.FC<TripInputFormProps> = ({ onSubmit }) => {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const [showCalendar, setShowCalendar] = useState(false)
  const [picking, setPicking] = useState<"from" | "to" | undefined>(undefined)

  const rangeRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ source, destination, startDate: dateRange?.from, endDate: dateRange?.to })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap justify-center items-center gap-4 w-full max-w-6xl bg-black/20 backdrop-blur-md p-6 rounded-2xl shadow-lg relative"
    >
      {/* Source */}
      <input
        type="text"
        placeholder="From"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="flex-1 min-w-[180px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
      />

      {/* Destination */}
      <input
        type="text"
        placeholder="To"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="flex-1 min-w-[180px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
      />

      {/* Depart / Return (Range) */}
      <div ref={rangeRef} className="relative flex-1 min-w-[360px]">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Depart"
            value={dateRange?.from ? dateRange.from.toLocaleDateString() : ""}
            readOnly
            onClick={() => {
              setPicking("from")
              setShowCalendar(!showCalendar)
            }}
            className="flex-1 min-w-[160px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          />
          <input
            type="text"
            placeholder="Return"
            value={dateRange?.to ? dateRange.to.toLocaleDateString() : ""}
            readOnly
            onClick={() => {
              setPicking("to")
              setShowCalendar(!showCalendar)
            }}
            className="flex-1 min-w-[160px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          />
        </div>
        {showCalendar && (
          <div className="absolute top-full mt-2 z-50">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onDayClick={(day) => {
                setDateRange((prev) => {
                  const current = prev ?? { from: undefined, to: undefined }
                  let next: DateRange = { from: current.from, to: current.to }

                  if (picking === "from") {
                    if (current.to && day > current.to) {
                      next = { from: day, to: undefined }
                    } else {
                      next = { from: day, to: current.to }
                    }
                    // After selecting start, auto-advance to picking return
                    if (!next.to) {
                      setPicking("to")
                    }
                  } else if (picking === "to") {
                    if (current.from && day < current.from) {
                      next = { from: day, to: current.from }
                    } else {
                      next = { from: current.from ?? day, to: day }
                    }
                  } else {
                    // No explicit picking: mimic natural range selection
                    if (!current.from || (current.from && current.to)) {
                      next = { from: day, to: undefined }
                      setPicking("to")
                    } else if (current.from && !current.to) {
                      if (day < current.from) {
                        next = { from: day, to: current.from }
                      } else {
                        next = { from: current.from, to: day }
                      }
                    }
                  }

                  // Auto close if both ends chosen
                  if (next.from && next.to) {
                    setShowCalendar(false)
                    setPicking(undefined)
                  }
                  return next
                })
              }}
              defaultMonth={dateRange?.from ?? dateRange?.to ?? new Date()}
              className="rounded-lg border bg-black/20 backdrop-blur-sm"
              classNames={{
                today: "border border-white text-white bg-transparent font-semibold rounded-lg"
              }}
            />
          </div>
        )}
      </div>
      {/* Submit */}
      <button
        type="submit"
        className="bg-white text-[#3A1C71] font-semibold py-2 px-10 rounded-lg hover:scale-105 hover:bg-gray-100 transition duration-300 shrink-0"
      >
        Plan My Trip
      </button>
    </form>
  )
}
