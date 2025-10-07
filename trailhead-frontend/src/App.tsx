import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Home";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import type { Currency } from "./components/Navbar";

const App: React.FC = () => {
    // global state for currency setting (interaction b/w navbar and slider)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: "INR",
    symbol: "₹",
  });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />}
        />
        <Route
          path="/auth"
          element={<LoginPage selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />}
        />
        <Route
          path="/main"
          element={<MainPage selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />}
        />
      </Routes>
    </Router>
  );
};

export default App;




