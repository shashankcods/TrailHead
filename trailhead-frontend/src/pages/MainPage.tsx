import React, { useState, useEffect } from "react"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import CurrencySlider from "@/components/Slider"
import WeatherForecast, { type WeatherData } from "@/components/Weather"

interface MainPageProps {
  selectedCurrency: Currency
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

const MainPage: React.FC<MainPageProps> = ({ selectedCurrency, setSelectedCurrency }) => {
  const [budget, setBudget] = useState(1000)
  const [minBudget, setMinBudget] = useState(1000)
  const [maxBudget, setMaxBudget] = useState(500000)
  const [exchangeRate, setExchangeRate] = useState(1)

  // **Default mock weather data to show on page load**
    const [weatherData, setWeatherData] = useState<WeatherData[]>([
        { date: new Date().toISOString(), maxTemp: 28, minTemp: 18, rainChance: 10, condition: 'sunny' },
        { date: new Date(Date.now() + 86400000).toISOString(), maxTemp: 25, minTemp: 16, rainChance: 60, condition: 'rain' },
        { date: new Date(Date.now() + 2 * 86400000).toISOString(), maxTemp: 22, minTemp: 14, rainChance: 30, condition: 'cloudy' },
        { date: new Date(Date.now() + 3 * 86400000).toISOString(), maxTemp: 30, minTemp: 20, rainChance: 5, condition: 'sunny' },
        { date: new Date(Date.now() + 4 * 86400000).toISOString(), maxTemp: 27, minTemp: 18, rainChance: 20, condition: 'partly cloudy' },
        { date: new Date(Date.now() + 5 * 86400000).toISOString(), maxTemp: 24, minTemp: 15, rainChance: 50, condition: 'drizzle' },
        { date: new Date(Date.now() + 6 * 86400000).toISOString(), maxTemp: 21, minTemp: 13, rainChance: 80, condition: 'storm' },
        { date: new Date(Date.now() + 7 * 86400000).toISOString(), maxTemp: 26, minTemp: 17, rainChance: 10, condition: 'sunny' },
        { date: new Date(Date.now() + 8 * 86400000).toISOString(), maxTemp: 23, minTemp: 16, rainChance: 40, condition: 'cloudy' },
        { date: new Date(Date.now() + 9 * 86400000).toISOString(), maxTemp: 29, minTemp: 19, rainChance: 0, condition: 'sunny' },
        { date: new Date(Date.now() + 10 * 86400000).toISOString(), maxTemp: 22, minTemp: 14, rainChance: 30, condition: 'fog' },
        { date: new Date(Date.now() + 11 * 86400000).toISOString(), maxTemp: 25, minTemp: 15, rainChance: 60, condition: 'rain' },
        { date: new Date(Date.now() + 12 * 86400000).toISOString(), maxTemp: 20, minTemp: 12, rainChance: 70, condition: 'snow' },
        { date: new Date(Date.now() + 13 * 86400000).toISOString(), maxTemp: 27, minTemp: 18, rainChance: 15, condition: 'partly cloudy' },
        { date: new Date(Date.now() + 14 * 86400000).toISOString(), maxTemp: 28, minTemp: 19, rainChance: 5, condition: 'sunny' },
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
        // Mock data
        setWeatherData([
          {
            date: new Date().toISOString(),
            maxTemp: 28,
            minTemp: 18,
            rainChance: 10,
            condition: 'sunny'
          },
          {
            date: new Date(Date.now() + 86400000).toISOString(),
            maxTemp: 25,
            minTemp: 16,
            rainChance: 60,
            condition: 'rain'
          },
          {
            date: new Date(Date.now() + 172800000).toISOString(),
            maxTemp: 22,
            minTemp: 14,
            rainChance: 30,
            condition: 'cloudy'
          },
        ])
      })
      .catch((err) => console.error("Error sending trip data:", err))
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-white hide-scrollbar">
        <Navbar selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />

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
          
          {/* Render Weather Forecast */}
          {weatherData.length > 0 && <WeatherForecast weatherData={weatherData} />}

        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage











