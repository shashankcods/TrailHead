import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar, { type Currency } from "../components/Navbar";
import LoginPopup from "../components/LoginPopup";
import { useAuth } from "../context/AuthContext";
import GradientBackground from "./GradientBackground";

interface LandingPageProps {
    selectedCurrency: Currency;
    setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  }

const LandingPage: React.FC<LandingPageProps> = ({ selectedCurrency, setSelectedCurrency }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate("/main");
    } else {
      setIsLoginOpen(true); // opens popup or else navigates directly to main if already authenticated
    }
  };  

  return (
    <GradientBackground>
      <Navbar selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} showPlanAndResultsButtons={false} />
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h2 className="text-black dark:text-white text-4xl sm:text-5xl md:text-6xl font-extrabold font-family-ubuntu">
          A hassle-free way to plan your trips
        </h2>
        <p className="text-black/80 dark:text-white/80 text-lg sm:text-xl md:text-2xl mt-4 font-family-opensans px-40">
          Generate AI-powered itineraries with real flights, hotels, and local attractions. Chat to modify your plan on the fly, explore restaurant picks, live events, weather forecasts, area safety scores, and a full budget planner with multi-currency support.
        </p>
        <button
          onClick={handleButtonClick}
          className="mt-6 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300 border border-black dark:border-white"
        >
          Create your own trail
        </button>
      </div>

      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />


      <footer className="py-6 text-center text-sm font-family-opensans bg-black/5 dark:bg-white/5 text-black dark:text-white">
        © {new Date().getFullYear()} TrailHead. Made with ❤️ by Team Figma Boys.
      </footer>
    </GradientBackground>
  );
};

export default LandingPage;



