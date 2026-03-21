import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import BudgetPlanner from "@/components/BudgetPlanner"
import { type ItineraryDay } from "@/components/Itinerary";

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

  const [itinerary] = useState<ItineraryDay[]>([
    { day: 1, date: new Date().toISOString(), points: [
      "Arrive at Tokyo Narita Airport and go through immigration.",
      "Check-in at your hotel and unpack luggage.",
      "Take a leisurely evening walk around Shinjuku, enjoy neon lights and street food.",
      "Have dinner at a local Izakaya and try different small plates and drinks."
    ]},
    { day: 2, date: new Date(Date.now() + 86400000).toISOString(), points: [
      "Visit Asakusa and explore Senso-ji Temple, admire the historic architecture.",
      "Walk along Nakamise Street and try local snacks like ningyo-yaki and senbei.",
      "Take a Sumida River cruise to see Tokyo from a different perspective.",
      "End the day at Tokyo Skytree for panoramic city views.",
      "Dinner at a traditional sushi restaurant near Asakusa."
    ]},
    { day: 3, date: new Date(Date.now() + 2 * 86400000).toISOString(), points: [
      "Head to Shibuya to experience the famous Shibuya Crossing.",
      "Visit the Hachiko Statue and take pictures.",
      "Explore the trendy shops and boutiques in Harajuku, including Takeshita Street.",
      "Have lunch at a themed café in Harajuku.",
      "Spend the evening at Meiji Jingu Shrine for a peaceful walk.",
      "Return to Shibuya for dinner and nightlife."
    ]},
    { day: 4, date: new Date(Date.now() + 3 * 86400000).toISOString(), points: [
      "Take a day trip to Yokohama and visit the Cup Noodles Museum.",
      "Walk along Yokohama Chinatown and try dumplings and local specialties.",
      "Explore Minato Mirai area and ride the Cosmo Clock 21 Ferris wheel.",
      "Return to Tokyo in the evening and relax at the hotel."
    ]},
    { day: 5, date: new Date(Date.now() + 4 * 86400000).toISOString(), points: [
      "Visit Tsukiji Outer Market and sample fresh seafood and street snacks.",
      "Walk to Ginza for high-end shopping and sightseeing.",
      "Have lunch at a traditional tempura restaurant.",
      "Explore Kabukiza Theatre and possibly watch a short Kabuki performance.",
      "Evening stroll at Hibiya Park and enjoy local cafes."
    ]},
    { day: 6, date: new Date(Date.now() + 5 * 86400000).toISOString(), points: [
      "Day trip to Odaiba, visit teamLab Borderless digital art museum.",
      "Walk along Odaiba Seaside Park and see the Rainbow Bridge.",
      "Have lunch at DiverCity Tokyo Plaza and check out the giant Gundam statue.",
      "Relax at Oedo-Onsen-Monogatari hot spring theme park.",
      "Return to hotel and have dinner at a ramen shop."
    ]},
    { day: 7, date: new Date(Date.now() + 6 * 86400000).toISOString(), points: [
      "Take a morning trip to Ueno Park and visit Tokyo National Museum.",
      "Enjoy street food at Ameya-Yokocho Market.",
      "Visit Akihabara to explore electronics shops and anime/manga stores.",
      "Play arcade games at a local game center.",
      "Have dinner at a local curry house or tonkatsu restaurant."
    ]},
    { day: 8, date: new Date(Date.now() + 7 * 86400000).toISOString(), points: [
      "Travel to Mitaka to visit Ghibli Museum, pre-book tickets required.",
      "Enjoy the exhibits and short animated films exclusive to the museum.",
      "Lunch at a nearby café with themed snacks and drinks.",
      "Return to central Tokyo and explore Ikebukuro’s Sunshine City complex.",
      "Evening shopping and dinner in Ikebukuro."
    ]},
    { day: 9, date: new Date(Date.now() + 8 * 86400000).toISOString(), points: [
      "Visit Roppongi Hills and Mori Art Museum for contemporary art exhibitions.",
      "Walk through Tokyo Midtown and enjoy modern architecture.",
      "Lunch at a rooftop café with city views.",
      "Explore nightlife in Roppongi or take a cruise along Tokyo Bay.",
      "Dinner at a sushi or yakiniku restaurant nearby."
    ]},
    { day: 10, date: new Date(Date.now() + 9 * 86400000).toISOString(), points: [
      "Check out of the hotel and store luggage if needed.",
      "Last-minute shopping at local souvenir shops.",
      "Visit any missed attractions or take a relaxing stroll in a local park.",
      "Head to Narita/Haneda Airport for departure."
    ]},
  ]);

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
    const tripData = { ...data, budget, budgetAllocation }
    console.log("🚀 Sending to orchestrator:", tripData)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      })
      if (!res.ok) throw new Error(`Backend returned ${res.status}`)
      const result = await res.json()
      console.log("✅ Parsed orchestrator response:", result)

      const safetyData =
        result?.safety || result?.insights?.safety || result?.trip?.safety || null

      navigate("/results", {
        state: {
          itinerary,
          weatherData: result.weather?.forecast || [],
          restaurants: result.food?.restaurants || [],
          redditPosts: result.reddit?.analyzedPosts || [],
          safety: safetyData,
          calendarUrl: result.calendar?.downloadUrl || "",
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





