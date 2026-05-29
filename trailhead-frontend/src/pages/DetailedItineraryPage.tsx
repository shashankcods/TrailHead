import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Currency } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import DetailedItinerary from "@/components/results/DetailedItinerary";
import PlannerExtras from "@/components/results/PlannerExtras";
import type { PlannerData } from "@/types/planner";

interface DetailedItineraryPageProps {
  selectedCurrency: Currency;
}

interface ItineraryLocationState {
  plannerData?: PlannerData;
}

const DetailedItineraryPage: React.FC<DetailedItineraryPageProps> = ({
  selectedCurrency,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const plannerData = (location.state as ItineraryLocationState | null)
    ?.plannerData;

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar showCurrencyToggle={false} />
        {plannerData ? (
          <main className="flex-1 p-4 lg:p-8 pb-12 max-w-6xl mx-auto w-full">
            <div className="th-card p-6 md:p-8 space-y-10">
              <DetailedItinerary
                plannerData={plannerData}
                onBack={() => navigate("/results", { state: { plannerData } })}
              />
              <PlannerExtras
                plannerData={plannerData}
                selectedCurrency={selectedCurrency}
              />
            </div>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="th-soft-card p-8 text-center max-w-md">
              <h2 className="th-title mb-2">Detailed itinerary unavailable</h2>
              <p className="th-subtitle mb-6">
                Open an itinerary from results first, or plan a trip to generate
                one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/results")}
                  className="inline-block py-3 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.02] transition"
                >
                  Back to Results
                </button>
                <Link
                  to="/main"
                  className="inline-block py-3 px-6 rounded-xl border border-black/25 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white font-bold"
                >
                  Plan Your Trip
                </Link>
              </div>
            </div>
          </main>
        )}
      </div>
    </GradientBackground>
  );
};

export default DetailedItineraryPage;
