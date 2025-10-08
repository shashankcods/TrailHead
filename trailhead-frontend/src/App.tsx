import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Home";
import MainPage from "./pages/MainPage";
import type { Currency } from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext"; // <-- import this

const App: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: "INR",
    symbol: "₹",
  });

  return (
    <AuthProvider>
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;





