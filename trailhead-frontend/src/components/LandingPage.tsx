import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#3A1C71] to-[#D76D77]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <h1 className="text-white text-2xl font-bold font-family-ubuntu">TrailHead</h1>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-4">
        <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold font-family-ubuntu">
          A hassle-free way to plan your trips
        </h2>
        <p className="text-white text-lg sm:text-xl md:text-2xl mt-4 font-family-opensans px-40">
        Get community-driven travel tips from fellow travelers, estimate your trip budget with sustainability scores, 
    discover local food experiences, check area safety, and adjust plans with interactive budget ranges and group size options — all in one place.
        </p>
        <button className="mt-6 px-6 py-3 bg-white text-[#3A1C71] font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300">
          Create your own trail
        </button>
      </div>
      <footer className="py-6 text-center text-sm font-family-opensans bg-black/20 text-white">
        © {new Date().getFullYear()} TrailHead. Made with ❤️ by Team Figma Boys.
      </footer>
    </div>
  );
};

export default LandingPage;


