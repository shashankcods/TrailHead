import React, { useState, useEffect } from "react"
import Navbar, { type Currency } from "../components/Navbar"
import GradientBackground from "@/components/GradientBackground"
import { TripInputForm } from "@/components/TripInputForm"
import CurrencySlider from "@/components/Slider"

interface MainPageProps {
  selectedCurrency: Currency
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

const MainPage: React.FC<MainPageProps> = ({ selectedCurrency, setSelectedCurrency }) => {
  const [budget, setBudget] = useState(1000)
  const [minBudget, setMinBudget] = useState(1000)
  const [maxBudget, setMaxBudget] = useState(500000)
  const [exchangeRate, setExchangeRate] = useState(1)

  // fetching conversion rate whenever currency is changed
  useEffect(() => {
    const fetchRate = async () => {
      // If the selected currency is INR, no conversion is needed
      if (selectedCurrency.code === "INR") {
        setExchangeRate(1)
        setMinBudget(1000)
        setMaxBudget(5000000)
        return
      }

      try {
        // Fetch rate with INR as base
        const res = await fetch(
          `https://hexarate.paikama.co/api/rates/latest/INR?target=${selectedCurrency.code}`
        )
        const data = await res.json()

        if (data?.data?.mid) {
          const rate = data.data.mid
          setExchangeRate(rate)

          // Calculate new slider values (rounded for neatness)
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
      .then((response) => console.log("Backend response:", response))
      .catch((err) => console.error("Error sending trip data:", err))
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-white">
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
        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage










