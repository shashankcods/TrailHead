import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Home";
import MainPage from "./pages/MainPage";
import ResultsPage from "./pages/ResultsPage";
import type { Currency } from "./components/Navbar";
import OAuthSuccess from "./pages/OAuthSuccess";

const App: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: "INR",
    symbol: "₹",
  });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
            />
          }
        />
        <Route
          path="/main"
          element={
            <MainPage
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              selectedCurrency={selectedCurrency}
            />
          }
        />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </Router>
  );
};

export default App;






