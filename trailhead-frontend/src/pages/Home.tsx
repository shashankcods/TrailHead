import React from "react";
import LandingPage from "../components/LandingPage";
import type { Currency } from "../components/Navbar";

interface HomeProps {
  selectedCurrency: Currency;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
}

const Home: React.FC<HomeProps> = ({ selectedCurrency, setSelectedCurrency }) => {
  return (
    <div>
      <LandingPage selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
    </div>
  );
};

export default Home;
