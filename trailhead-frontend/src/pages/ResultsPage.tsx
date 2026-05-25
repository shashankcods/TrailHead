import React from "react";
import type { Currency } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";

interface ResultsPageProps {
  selectedCurrency: Currency;
}

const ResultsPage: React.FC<ResultsPageProps> = () => {
  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar
          showCurrencyToggle={false}
        />

        <div className="flex flex-1">
          <main className="flex-1">
            <div className="h-full flex items-center justify-center px-4">
              <div className="th-soft-card p-6 text-center">
                <h2 className="th-title mb-2">Nothing is planned yet</h2>
                <p className="th-subtitle">
                  Plan a trip from the Plan Your Trip page to view results here.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </GradientBackground>
  );
};

export default ResultsPage;

