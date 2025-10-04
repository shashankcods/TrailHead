import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#3A1C71] to-[#D76D77]">
      <h1 className="text-white text-4xl sm:text-5xl md:text-6xl text-center font-family-ubuntu font-extrabold">
        TrailHead
      </h1>
      <p className="text-white text-lg sm:text-xl md:text-2xl mt-4 font-family-opensans">
        your travel planning swiss knife
      </p>
    </div>
  );
};

export default LandingPage;
