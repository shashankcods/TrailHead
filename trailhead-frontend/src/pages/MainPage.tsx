import React, { useState, useEffect } from "react"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import CurrencySlider from "@/components/Slider"
import WeatherForecast, { type WeatherData } from "@/components/Weather"
import RedditInsights from "@/components/RedditInsights"
import FoodInsights, { type Restaurant } from "@/components/Restaurants"
import Itinerary, { type ItineraryDay } from "@/components/Itinerary";


// reddit insights component
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

  const [itinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      date: new Date().toISOString(),
      points: [
        "Arrive at Tokyo Narita Airport and go through immigration.",
        "Check-in at your hotel and unpack luggage.",
        "Take a leisurely evening walk around Shinjuku, enjoy neon lights and street food.",
        "Have dinner at a local Izakaya and try different small plates and drinks."
      ],
    },
    {
      day: 2,
      date: new Date(Date.now() + 86400000).toISOString(),
      points: [
        "Visit Asakusa and explore Senso-ji Temple, admire the historic architecture.",
        "Walk along Nakamise Street and try local snacks like ningyo-yaki and senbei.",
        "Take a Sumida River cruise to see Tokyo from a different perspective.",
        "End the day at Tokyo Skytree for panoramic city views.",
        "Dinner at a traditional sushi restaurant near Asakusa."
      ],
    },
    {
      day: 3,
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      points: [
        "Head to Shibuya to experience the famous Shibuya Crossing.",
        "Visit the Hachiko Statue and take pictures.",
        "Explore the trendy shops and boutiques in Harajuku, including Takeshita Street.",
        "Have lunch at a themed café in Harajuku.",
        "Spend the evening at Meiji Jingu Shrine for a peaceful walk.",
        "Return to Shibuya for dinner and nightlife."
      ],
    },
    {
      day: 4,
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      points: [
        "Take a day trip to Yokohama and visit the Cup Noodles Museum.",
        "Walk along Yokohama Chinatown and try dumplings and local specialties.",
        "Explore Minato Mirai area and ride the Cosmo Clock 21 Ferris wheel.",
        "Return to Tokyo in the evening and relax at the hotel."
      ],
    },
    {
      day: 5,
      date: new Date(Date.now() + 4 * 86400000).toISOString(),
      points: [
        "Visit Tsukiji Outer Market and sample fresh seafood and street snacks.",
        "Walk to Ginza for high-end shopping and sightseeing.",
        "Have lunch at a traditional tempura restaurant.",
        "Explore Kabukiza Theatre and possibly watch a short Kabuki performance.",
        "Evening stroll at Hibiya Park and enjoy local cafes."
      ],
    },
    {
      day: 6,
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      points: [
        "Day trip to Odaiba, visit teamLab Borderless digital art museum.",
        "Walk along Odaiba Seaside Park and see the Rainbow Bridge.",
        "Have lunch at DiverCity Tokyo Plaza and check out the giant Gundam statue.",
        "Relax at Oedo-Onsen-Monogatari hot spring theme park.",
        "Return to hotel and have dinner at a ramen shop."
      ],
    },
    {
      day: 7,
      date: new Date(Date.now() + 6 * 86400000).toISOString(),
      points: [
        "Take a morning trip to Ueno Park and visit Tokyo National Museum.",
        "Enjoy street food at Ameya-Yokocho Market.",
        "Visit Akihabara to explore electronics shops and anime/manga stores.",
        "Play arcade games at a local game center.",
        "Have dinner at a local curry house or tonkatsu restaurant."
      ],
    },
    {
      day: 8,
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      points: [
        "Travel to Mitaka to visit Ghibli Museum, pre-book tickets required.",
        "Enjoy the exhibits and short animated films exclusive to the museum.",
        "Lunch at a nearby café with themed snacks and drinks.",
        "Return to central Tokyo and explore Ikebukuro’s Sunshine City complex.",
        "Evening shopping and dinner in Ikebukuro."
      ],
    },
    {
      day: 9,
      date: new Date(Date.now() + 8 * 86400000).toISOString(),
      points: [
        "Visit Roppongi Hills and Mori Art Museum for contemporary art exhibitions.",
        "Walk through Tokyo Midtown and enjoy modern architecture.",
        "Lunch at a rooftop café with city views.",
        "Explore nightlife in Roppongi or take a cruise along Tokyo Bay.",
        "Dinner at a sushi or yakiniku restaurant nearby."
      ],
    },
    {
      day: 10,
      date: new Date(Date.now() + 9 * 86400000).toISOString(),
      points: [
        "Check out of the hotel and store luggage if needed.",
        "Last-minute shopping at local souvenir shops.",
        "Visit any missed attractions or take a relaxing stroll in a local park.",
        "Head to Narita/Haneda Airport for departure."
      ],
    },
  ]);



  const [weatherData, setWeatherData] = useState<WeatherData[]>([
    { date: new Date().toISOString(), maxTemp: 28, minTemp: 18, rainAmount: 10, condition: 'sunny' },
    { date: new Date(Date.now() + 86400000).toISOString(), maxTemp: 25, minTemp: 16, rainAmount: 5, condition: 'partly cloudy' },
    { date: new Date(Date.now() + 2 * 86400000).toISOString(), maxTemp: 22, minTemp: 14, rainAmount: 30, condition: 'rain' },
    { date: new Date(Date.now() + 3 * 86400000).toISOString(), maxTemp: 27, minTemp: 19, rainAmount: 0, condition: 'sunny' },
    { date: new Date(Date.now() + 4 * 86400000).toISOString(), maxTemp: 23, minTemp: 15, rainAmount: 20, condition: 'drizzle' },
    { date: new Date(Date.now() + 5 * 86400000).toISOString(), maxTemp: 21, minTemp: 13, rainAmount: 0, condition: 'cloudy' },
    { date: new Date(Date.now() + 6 * 86400000).toISOString(), maxTemp: 26, minTemp: 18, rainAmount: 0, condition: 'sunny' },
    { date: new Date(Date.now() + 7 * 86400000).toISOString(), maxTemp: 24, minTemp: 16, rainAmount: 15, condition: 'rain' },
    { date: new Date(Date.now() + 8 * 86400000).toISOString(), maxTemp: 27, minTemp: 19, rainAmount: 0, condition: 'sunny' },
    { date: new Date(Date.now() + 9 * 86400000).toISOString(), maxTemp: 22, minTemp: 14, rainAmount: 5, condition: 'partly cloudy' },
    { date: new Date(Date.now() + 10 * 86400000).toISOString(), maxTemp: 25, minTemp: 17, rainAmount: 0, condition: 'sunny' },
    { date: new Date(Date.now() + 11 * 86400000).toISOString(), maxTemp: 23, minTemp: 15, rainAmount: 10, condition: 'rain' },
    { date: new Date(Date.now() + 12 * 86400000).toISOString(), maxTemp: 28, minTemp: 18, rainAmount: 0, condition: 'sunny' },
    { date: new Date(Date.now() + 13 * 86400000).toISOString(), maxTemp: 21, minTemp: 13, rainAmount: 0, condition: 'cloudy' },
    { date: new Date(Date.now() + 14 * 86400000).toISOString(), maxTemp: 26, minTemp: 18, rainAmount: 5, condition: 'partly cloudy' },
  ])

  const [redditPosts] = useState<RedditPost[]>([
    {
      title: "First-time traveler to Tokyo looking for tips",
      comment:
        "Note: Suica cards are more available now at major stations. Google Maps is great for train transfers.",
      upvotes: 42,
      subreddit: "JapanTravel",
      url: "https://www.reddit.com/r/JapanTravel/comments/xxxxxx",
    },
    {
      title: "Back from a 10-day trip in Tokyo!",
      comment:
        "Instead of carrying a pocket WiFi, a local eSIM worked perfectly. Cheap and easy.",
      upvotes: 31,
      subreddit: "travel",
      url: "https://www.reddit.com/r/travel/comments/yyyyyy",
    },
    {
      title: "Hidden gems around Shibuya?",
      comment:
        "Check out Nonbei Yokocho and Miyashita Park — both have amazing food and atmosphere away from the crowds.",
      upvotes: 55,
      subreddit: "Tokyo",
      url: "https://www.reddit.com/r/Tokyo/comments/zzzzzz",
    },
    {
      title: "Tokyo metro pass worth it?",
      comment:
        "Only if you're using the subway multiple times a day. Otherwise, just stick to Suica or Pasmo for flexibility.",
      upvotes: 27,
      subreddit: "solotravel",
      url: "https://www.reddit.com/r/solotravel/comments/aaaaaa",
    },
  ]);


  // Dummy restaurants
  const [restaurants] = useState<Restaurant[]>([
    { name: "Sushi Dai", address: "Tsukiji Market, Tokyo", rating: 4.8, totalReviews: 340, priceLevel: 3, googleMapsUrl: "https://goo.gl/maps/abc123" },
    { name: "Ichiran Ramen", address: "Shibuya, Tokyo", rating: 4.5, totalReviews: 1200, priceLevel: 2, googleMapsUrl: "https://goo.gl/maps/def456" },
    { name: "Tempura Kondo", address: "Ginza, Tokyo", rating: 4.7, totalReviews: 450, priceLevel: 3, googleMapsUrl: "https://goo.gl/maps/ghi789" },
    { name: "Kyubey", address: "Ginza, Tokyo", rating: 4.6, totalReviews: 890, priceLevel: 3, googleMapsUrl: "https://goo.gl/maps/jkl012" },
    { name: "Afuri Ramen", address: "Ebisu, Tokyo", rating: 4.4, totalReviews: 620, priceLevel: 2, googleMapsUrl: "https://goo.gl/maps/mno345" },
  ])

  // fetching conversion rate whenever currency is changed
  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency.code === "INR") {
        setExchangeRate(1)
        setMinBudget(1000)
        setMaxBudget(5000000)
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

  const handleFormSubmit = (data: {
    source: string
    destination: string
    startDate: Date | undefined
    endDate: Date | undefined
  }) => {
    const tripData = {
      ...data,
      currency: selectedCurrency.code,
      totalBudget: budget,
    }

    console.log("Sending to backend:", tripData)

    fetch("http://localhost:5000/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("Backend response:", response)
      })
      .catch((err) => console.error("Error sending trip data:", err))
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-white">
        <Navbar
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
        />

        <div className="flex-grow flex flex-col items-center justify-start px-4 pt-20 space-y-5">
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


          {/* Weather, Food & Reddit Insights side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 w-full">
            <div className="h-full">
              {weatherData.length > 0 && <WeatherForecast weatherData={weatherData} />}
            </div>

            <div className="h-full">
              <FoodInsights
                restaurants={restaurants}
                selectedCurrency={selectedCurrency}
              />
            </div>

            <div className="h-full flex items-center">
              <RedditInsights posts={redditPosts} />
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage














