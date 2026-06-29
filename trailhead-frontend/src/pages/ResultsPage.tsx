import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Currency } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import TripSummaryContent from "@/components/results/TripSummaryContent";
import type { PlannerData } from "@/types/planner";

interface ResultsPageProps {
  selectedCurrency: Currency;
}

interface ResultsLocationState {
  plannerData?: PlannerData;
  savedTripId?: string;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedCurrency }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const plannerData = (location.state as ResultsLocationState | null)
    ?.plannerData;
  const savedTripId = (location.state as ResultsLocationState | null)
    ?.savedTripId;

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar showCurrencyToggle={false} />

        <div className="flex flex-1 flex-col lg:flex-row">
          {plannerData ? (
            <main className="flex-1 p-4 lg:p-8 pb-12 max-w-5xl mx-auto w-full">
              <div className="th-card p-6 md:p-8 space-y-10">
                <section id="summary-section" className="scroll-mt-24">
                  <TripSummaryContent
                    plannerData={plannerData}
                    selectedCurrency={selectedCurrency}
                    onViewItinerary={() =>
                      navigate("/itinerary", { state: { plannerData, savedTripId } })
                    }
                  />
                </section>
              </div>
            </main>
          ) : (
            <main className="flex-1 flex items-center justify-center px-4 py-16">
              <div className="th-soft-card p-8 text-center max-w-md">
                <h2 className="th-title mb-2">Nothing is planned yet</h2>
                <p className="th-subtitle mb-6">
                  Plan a trip from the Plan New Trip page to view results here.
                </p>
                <Link
                  to="/main"
                  className="inline-block py-3 px-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.02] transition"
                >
                  Plan New Trip
                </Link>
              </div>
            </main>
          )}
        </div>
      </div>
    </GradientBackground>
  );
};

export default ResultsPage;
