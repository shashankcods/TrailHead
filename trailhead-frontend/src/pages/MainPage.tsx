import React, { useState, useEffect } from "react"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import CurrencySlider from "@/components/Slider"
import WeatherForecast, { type WeatherData } from "@/components/Weather"
import RedditInsights from "@/components/RedditInsights"
import FoodInsights, { type Restaurant } from "@/components/Restaurants"
import Itinerary, { type ItineraryDay } from "@/components/Itinerary";
import SafetyInfo from "@/components/SafetyInfo"

type RedditPost = {
  title: string
  comment: string
  upvotes: number
  subreddit: string
  url: string
}

interface MainPageProps {
  selectedCurrency: Currency
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

const MainPage: React.FC<MainPageProps> = ({
  selectedCurrency,
  setSelectedCurrency,
}) => {
  const [budget, setBudget] = useState(1000)
  const [minBudget, setMinBudget] = useState(1000)
  const [maxBudget, setMaxBudget] = useState(500000)
  const [exchangeRate, setExchangeRate] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [safety, setSafety] = useState<any>(null)

  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency.code === "INR") {
        setExchangeRate(1)
        setMinBudget(1000)
        setMaxBudget(500000)
        return
      }

      try {
        const res = await fetch(
          `https://hexarate.paikama.co/api/rates/latest/INR?target=${selectedCurrency.code}`
        )
        const data = await res.json()
        if (data?.data?.mid) {
          const rate = data.data.mid
          setExchangeRate(rate)
          const newMin = Math.round((1000 * rate) / 10) * 10
          const newMax = Math.round((500000 * rate) / 100) * 100
          const newBudget = Math.round(budget * rate)
          setMinBudget(newMin)
          setMaxBudget(newMax)
          setBudget(newBudget)
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
  }) => {
    const tripData = { ...data, budget }
    console.log("🚀 Sending to orchestrator:", tripData)
    setSubmitted(true)
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

      setWeatherData(result.weather?.forecast || [])
      setRestaurants(result.food?.restaurants || [])
      setRedditPosts(result.reddit?.analyzedPosts || [])
      setSafety(safetyData)
    } catch (err) {
      console.error("❌ Failed to fetch trip data:", err)
      alert("Error fetching trip details. Check backend logs or endpoint URL.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-white">
        {/* Navbar */}
        <Navbar
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
        />

        {/* Centered form before submission */}
        {!submitted && (
          <div className="flex-grow flex flex-col items-center justify-center px-4 space-y-5">
            <TripInputForm onSubmit={handleFormSubmit} />
            <CurrencySlider
              label="Trip Budget"
              value={budget}
              onChange={setBudget}
              selectedCurrency={selectedCurrency}
              min={minBudget}
              max={maxBudget}
              step={Math.round((maxBudget - minBudget) / 1000)}
            />
            <p className="text-gray-400 text-sm">
              1 INR = {exchangeRate.toFixed(3)} {selectedCurrency.code}
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
            <div className="text-white text-2xl font-semibold">
              Planning your trip...
            </div>
            <div className="mt-4 w-12 h-12 border-4 border-t-white border-gray-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Full layout after submission with smooth transition */}
        {submitted && !loading && (
          <div
            className="flex-grow flex flex-col items-center justify-start px-4 pt-20 space-y-5
                       transition-all duration-700 ease-out opacity-0 translate-y-6"
            ref={(el) => {
              if (el) {
                requestAnimationFrame(() => {
                  el.classList.remove("opacity-0", "translate-y-6");
                });
              }
            }}
          >
            <TripInputForm onSubmit={handleFormSubmit} />
            <CurrencySlider
              label="Trip Budget"
              value={budget}
              onChange={setBudget}
              selectedCurrency={selectedCurrency}
              min={minBudget}
              max={maxBudget}
              step={Math.round((maxBudget - minBudget) / 1000)}
            />
            <p className="text-gray-400 text-sm">
              1 INR = {exchangeRate.toFixed(3)} {selectedCurrency.code}
            </p>

            {/* Itinerary */}
            <div className="w-full max-w-10xl px-4">
              <Itinerary itinerary={itinerary} />
            </div>

            {/* Dynamic Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 w-full">
              <WeatherForecast weatherData={weatherData} />
              <FoodInsights restaurants={restaurants} selectedCurrency={selectedCurrency} />
              <RedditInsights posts={redditPosts} />
            </div>

            {/* Safety Component */}
            <div className="w-full px-4">
              <SafetyInfo safety={safety} />
            </div>
          </div>
        )}
      </div>
    </GradientBackground>
  )
}

export default MainPage




