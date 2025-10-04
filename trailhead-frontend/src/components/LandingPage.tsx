import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GradientBackground from "../components/GradientBackground";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold font-family-ubuntu">
          A hassle-free way to plan your trips
        </h2>
        <p className="text-white text-lg sm:text-xl md:text-2xl mt-4 font-family-opensans px-40">
          Get community-driven travel tips from fellow travelers, estimate your trip budget with sustainability scores, 
          discover local food experiences, check area safety, and adjust plans with interactive budget ranges and group size options — all in one place.
        </p>
        <button 
          onClick={() => navigate("/main")}
          className="mt-6 px-6 py-3 bg-white text-[#3A1C71] font-bold rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transition duration-300">
          Create your own trail
        </button>
      </div>

      <footer className="py-6 text-center text-sm font-family-opensans bg-black/5 text-white">
        © {new Date().getFullYear()} TrailHead. Made with ❤️ by Team Figma Boys.
      </footer>
    </GradientBackground>
  );
};

export default LandingPage;



