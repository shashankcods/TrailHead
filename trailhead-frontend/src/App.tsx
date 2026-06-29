import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Home";
import MainPage from "./pages/MainPage";
import OAuthSuccess from "./pages/OAuthSuccess";
import { currencies, type Currency } from "./components/Navbar";
import BackendDownOverlay from "./components/BackendDownOverlay";

const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const DetailedItineraryPage = lazy(() => import("./pages/DetailedItineraryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));

const App: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  return (
    <Router>
      <BackendDownOverlay />
      <Suspense fallback={null}>
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
        <Route
          path="/itinerary"
          element={
            <DetailedItineraryPage />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default App;






