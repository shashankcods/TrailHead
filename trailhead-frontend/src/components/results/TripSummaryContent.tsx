import React from "react";
import type { Currency } from "@/components/Navbar";
import { currencies } from "@/components/Navbar";
import type { PlannerData } from "@/types/planner";

const getItineraryDays = (plannerData: PlannerData) => {
  if (Array.isArray(plannerData.itinerary)) return plannerData.itinerary;
  return plannerData.itinerary?.days ?? [];
};

interface TripSummaryContentProps {
  plannerData: PlannerData;
  selectedCurrency: Currency;
  onViewItinerary?: () => void;
}

const TripSummaryContent: React.FC<TripSummaryContentProps> = ({
  plannerData,
  selectedCurrency,
  onViewItinerary,
}) => {
  const trip = plannerData.trip ?? {};
  const source = trip.source || "—";
  const destination = trip.destination || "—";
  const tripDays = trip.trip_days ?? getItineraryDays(plannerData).length ?? 0;
  const adults = trip.adults ?? 1;
  const interests = plannerData.interests ?? [];
  const totalBudget = plannerData.budgets?.total ?? 0;
  const allocations = plannerData.budgets?.allocations ?? {};

  const resolvedCurrency =
    currencies.find((c) => c.code === plannerData.budgets?.currency) ??
    selectedCurrency;

  const formatMoney = (amount: number) =>
    `${resolvedCurrency.symbol}${amount.toLocaleString()}`;

  const allocationEntries = [
    { key: "travel", label: "Travel" },
    { key: "accommodation", label: "Accommodation" },
    { key: "food", label: "Food" },
    { key: "activities", label: "Activities" },
  ] as const;

  const tripStyle =
    interests.length > 0
      ? interests.slice(0, 2).join(" · ")
      : "Custom trip";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 shadow-sm">
        <div className="bg-gradient-to-br from-black via-black/90 to-black/75 dark:from-white dark:via-white/95 dark:to-white/85 px-6 py-8 md:px-8 md:py-10 text-white dark:text-black">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded-full border border-white/30 dark:border-black/20 bg-white/15 dark:bg-black/10 px-3 py-1 text-xs font-semibold">
              {tripStyle}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            {source} → {destination}
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Days", value: String(tripDays) },
          {
            label: "Travelers",
            value: String(adults),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="th-soft-card p-4 text-center"
          >
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-xs font-semibold text-black/55 dark:text-white/55 mt-1 uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Budget breakdown */}
      <div className="th-soft-card p-6 space-y-5">
        <h3 className="th-title">Budget Breakdown</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-black/55 dark:text-white/55">
              Total Budget
            </p>
            <p className="text-3xl font-extrabold mt-1">
              {formatMoney(totalBudget)}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {allocationEntries.map(({ key, label }) => {
            const amount = allocations[key] ?? 0;
            const pct =
              totalBudget > 0
                ? Math.round((amount / totalBudget) * 100)
                : 0;
            return (
              <div
                key={key}
                className="rounded-xl border border-black/10 dark:border-white/15 p-4"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-sm text-black/60 dark:text-white/60">
                    {pct}%
                  </span>
                </div>
                <p className="text-lg font-bold mt-1">{formatMoney(amount)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black dark:bg-white transition-all"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">
          Your itinerary is ready
        </h3>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
          We've finished planning your trip. Click below to view your full itinerary.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onViewItinerary}
          className="flex-1 py-3 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.01] transition duration-200"
        >
          View Itinerary →
        </button>
      </div>
    </div>
  );
};

export default TripSummaryContent;
