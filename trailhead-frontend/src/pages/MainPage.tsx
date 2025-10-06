import React, { useState } from "react"
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

  const handleFormSubmit = (data: {
    source: string
    destination: string
    startDate: Date | undefined
    endDate: Date | undefined
  }) => {
    console.log("Trip Data:", data)
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-white">
        <Navbar selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />

        <div className="flex-grow flex flex-col items-center justify-start px-4 pt-20 space-y-8">
          <TripInputForm onSubmit={handleFormSubmit} />

          <CurrencySlider
            label="Trip Budget"
            value={budget}
            onChange={setBudget}
            selectedCurrency={selectedCurrency}
            min={100}
            max={100000}
            step={50}
 // sets slider width
          />
        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage








