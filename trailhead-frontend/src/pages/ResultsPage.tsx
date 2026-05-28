import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { Currency } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import ResultsSidebar from "@/components/results/ResultsSidebar";
import TripSummaryContent from "@/components/results/TripSummaryContent";
import ItineraryPreview from "@/components/results/ItineraryPreview";
import PlannerExtras from "@/components/results/PlannerExtras";
import type { PlannerData } from "@/types/planner";

interface ResultsPageProps {
  selectedCurrency: Currency;
}

interface ResultsLocationState {
  plannerData?: PlannerData;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedCurrency }) => {
  const location = useLocation();
  const plannerData = (location.state as ResultsLocationState | null)
    ?.plannerData;

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar showCurrencyToggle={false} />

        <div className="flex flex-1 flex-col lg:flex-row">
          {plannerData ? (
            <>
              <div className="lg:border-r border-black/10 dark:border-white/20 p-4 lg:p-6 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto">
                <ResultsSidebar plannerData={plannerData} />
              </div>

              <main className="flex-1 p-4 lg:p-8 pb-12 max-w-5xl">
                <div className="th-card p-6 md:p-8 space-y-10">
                  <TripSummaryContent
                    plannerData={plannerData}
                    selectedCurrency={selectedCurrency}
                  />
                  <ItineraryPreview plannerData={plannerData} />
                  <PlannerExtras
                    plannerData={plannerData}
                    selectedCurrency={selectedCurrency}
                  />
                </div>
              </main>
            </>
          ) : (
            <main className="flex-1 flex items-center justify-center px-4 py-16">
              <div className="th-soft-card p-8 text-center max-w-md">
                <h2 className="th-title mb-2">Nothing is planned yet</h2>
                <p className="th-subtitle mb-6">
                  Plan a trip from the Plan Your Trip page to view results here.
                </p>
                <Link
                  to="/main"
                  className="inline-block py-3 px-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.02] transition"
                >
                  Plan Your Trip
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
