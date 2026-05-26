import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import BudgetPlanner from "@/components/BudgetPlanner"

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

const ACTIVITY_ID_TO_INTEREST: Record<string, string> = {
  beaches: "Beaches",
  "city-sightseeing": "City Sightseeing",
  "outdoor-adventures": "Outdoor Adventures",
  "festivals-events": "Festivals/Events",
  "food-exploration": "Food Exploration",
  nightlife: "Nightlife",
  shopping: "Shopping",
  "spa-wellness": "Spa & Wellness",
}

const mapActivitiesToInterests = (activities: string[]) =>
  activities.map((id) => ACTIVITY_ID_TO_INTEREST[id] ?? id)

const calculateTripDays = (
  startDate: string | undefined,
  endDate: string | undefined
): number => {
  if (!startDate) return 1
  if (!endDate) return 1
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffDays = Math.round(
    (end.getTime() - start.getTime()) / 86400000
  )
  return Math.max(1, diffDays + 1)
}

type BudgetAllocation = {
  travel: number
  accommodation: number
  food: number
  activities: number
}

interface MainPageProps {
  selectedCurrency: Currency
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

const MainPage: React.FC<MainPageProps> = ({
  selectedCurrency,
  setSelectedCurrency,
}) => {
  const navigate = useNavigate()
  const BASE_MIN_USD = 1000
  const BASE_MAX_USD = 100000

  const [budget, setBudget] = useState(BASE_MIN_USD)
  const [minBudget, setMinBudget] = useState(BASE_MIN_USD)
  const [maxBudget, setMaxBudget] = useState(BASE_MAX_USD)
  const [exchangeRate, setExchangeRate] = useState(1)
  const [loading, setLoading] = useState(false)
  const [budgetAllocation, setBudgetAllocation] = useState<BudgetAllocation>({
    travel: 25,
    accommodation: 25,
    food: 25,
    activities: 25,
  })

  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency.code === "USD") {
        setExchangeRate(1)
        setMinBudget(BASE_MIN_USD)
        setMaxBudget(BASE_MAX_USD)
        return
      }

      try {
        const res = await fetch(
          `https://hexarate.paikama.co/api/rates/latest/USD?target=${selectedCurrency.code}`
        )
        const data = await res.json()
        if (data?.data?.mid) {
          const rate = data.data.mid
          setExchangeRate(rate)
          const newMin = Math.round(BASE_MIN_USD * rate)
          const newMax = Math.round(BASE_MAX_USD * rate)
          setMinBudget(newMin)
          setMaxBudget(newMax)
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
      }
    }

    fetchRate()
  }, [selectedCurrency])

  const handleFormSubmit = async (data: {
    source: string
    destination: string
    startDate: string | undefined
    endDate: string | undefined
    travelers: number
    activities: string[]
  }) => {
    const trip_days = calculateTripDays(data.startDate, data.endDate)

    const payload = {
      source: data.source,
      destination: data.destination,
      start_date: data.startDate,
      trip_days,
      adults: data.travelers,
      interests: mapActivitiesToInterests(data.activities),
      budget: {
        total: budget,
        travel: budgetAllocation.travel,
        accommodation: budgetAllocation.accommodation,
        food: budgetAllocation.food,
        activities: budgetAllocation.activities,
      },
    }

    console.log("🚀 Planner request payload:", payload)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      console.log("✅ Planner API response:", result)

      if (!res.ok) {
        throw new Error(
          result?.message || result?.error || `Backend returned ${res.status}`
        )
      }

      const plannerData = result.data
      if (!plannerData) {
        throw new Error("No planner data in response")
      }

      navigate("/results", {
        state: {
          plannerData,
          itinerary: plannerData.itinerary,
          weatherData: plannerData.weather,
          restaurants: plannerData.restaurants,
          events: plannerData.events,
          safety: plannerData.safety,
          flights: plannerData.flights,
          hotels: plannerData.hotels,
        },
      })
    } catch (err) {
      console.error("❌ Failed to fetch trip data:", err)
      alert("Error fetching trip details. Check backend logs or endpoint URL.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar
          showCurrencyToggle={true}
        />

        <div className="flex flex-1">
          <main className="flex-1">
            <div className="flex-grow flex flex-col items-center justify-center px-6 py-6 pb-28 space-y-5">
              <div className="w-full max-w-6xl">
                <h2 className="text-[2.35rem] leading-tight md:text-[2.7rem] font-extrabold tracking-tight text-black dark:text-white">
                  Tell us your travel preferences
                </h2>
                <p className="text-[1.02rem] md:text-[1.08rem] text-black/70 dark:text-white/70 mt-3">
                  Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
                </p>
              </div>

              <TripInputForm onSubmit={handleFormSubmit} formId="trip-input-form" />
              <BudgetPlanner
                budget={budget}
                onBudgetChange={setBudget}
                onAllocationChange={setBudgetAllocation}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                min={minBudget}
                max={maxBudget}
                step={Math.round((maxBudget - minBudget) / 1000)}
              />
              <p className="th-subtitle">
                1 USD = {exchangeRate.toFixed(3)} {selectedCurrency.code}
              </p>
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black/70 dark:bg-white/40 flex flex-col items-center justify-center z-50">
                <div className="text-white dark:text-black text-2xl font-semibold">
                  Planning your trip...
                </div>
                <div className="mt-4 w-12 h-12 border-4 border-t-white dark:border-t-black border-white/40 dark:border-black/40 rounded-full animate-spin"></div>
              </div>
            )}
          </main>
        </div>

        {/* Fixed bottom action bar (Plan page only) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 dark:border-white/20 bg-white/90 dark:bg-black/90 backdrop-blur-md">
          <div className="w-full px-6 py-3 flex items-center justify-end">
            <button
              type="submit"
              form="trip-input-form"
              className="bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-10 rounded-xl hover:scale-[1.02] transition duration-300 border border-black dark:border-white"
            >
              Plan My Trip
            </button>
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage





