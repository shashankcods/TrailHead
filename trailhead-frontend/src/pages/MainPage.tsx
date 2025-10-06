import React from "react"
import GradientBackground from "../components/GradientBackground"
import Navbar from "../components/Navbar"
import { TripInputForm } from "../components/TripInputForm"

const MainPage: React.FC = () => {
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
        <Navbar />
        <div className="flex-grow flex items-start justify-center px-4 pt-20">
  <         TripInputForm onSubmit={handleFormSubmit} />
        </div>
      </div>
    </GradientBackground>
  )
}

export default MainPage






