"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar } from "./ui/calendar"

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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false)
      }
      if (endRef.current && !endRef.current.contains(event.target as Node)) {
        setShowEndCalendar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ source, destination, startDate, endDate })
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

      {/* Depart */}
      <div ref={startRef} className="relative flex-1 min-w-[160px]">
      <input
          type="text"
          placeholder="Depart"
          value={startDate ? startDate.toLocaleDateString() : ""}
          readOnly
          onClick={() => setShowStartCalendar(!showStartCalendar)}
          className="flex-1 min-w-[160px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
        />
        {showStartCalendar && (
          <div className="absolute top-full mt-2 z-50">
            <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                    setStartDate(date)
                    setShowStartCalendar(false)
                }}
                defaultMonth={startDate}
                className="rounded-lg border bg-transparent backdrop-blur-sm"
                classNames={{
                    today: "border border-white text-white bg-transparent font-semibold rounded-lg"
                }}
            />
          </div>
        )}
      </div>

      {/* Return */}
      <div ref={endRef} className="relative flex-1 min-w-[160px]">
      <input
          type="text"
          placeholder="Return"
          value={endDate ? endDate.toLocaleDateString() : ""}
          readOnly
          onClick={() => setShowEndCalendar(!showEndCalendar)}
          className="flex-1 min-w-[160px] p-3 rounded-md bg-transparent text-white placeholder-gray-300 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
        />
        {showEndCalendar && (
          <div className="absolute top-full mt-2 z-50">
            <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                    setEndDate(date)
                    setShowEndCalendar(false)
                }}
                defaultMonth={endDate}
                className="rounded-lg border bg-transparent backdrop-blur-sm"
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
        className="bg-white text-[#3A1C71] font-semibold py-2 px-6 rounded-lg hover:scale-105 hover:bg-gray-100 transition duration-300"
      >
        Plan My Trip
      </button>
    </form>
  )
}
