import React from "react";
import type { PlannerData } from "@/types/planner";

const STEPS = [
  { id: "destinations", label: "Destinations" },
  { id: "preferences", label: "Preferences" },
  { id: "budget", label: "Budget" },
  { id: "results", label: "Results" },
] as const;

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ResultsSidebarProps {
  plannerData: PlannerData;
}

const ResultsSidebar: React.FC<ResultsSidebarProps> = ({ plannerData }) => {
  const trip = plannerData.trip ?? {};
  const source = trip.source || "—";
  const destination = trip.destination || "—";
  const interests = plannerData.interests ?? [];

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
      <nav className="th-soft-card p-4 space-y-2">
        {STEPS.map((step) => {
          const isActive = step.id === "results";
          const isComplete = !isActive;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                isActive
                  ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                  : "border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white text-black dark:bg-black dark:text-white"
                    : "bg-black/10 text-black dark:bg-white/15 dark:text-white"
                }`}
              >
                {isComplete ? "✓" : "★"}
              </span>
              <span className="text-sm font-semibold">{step.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="th-soft-card p-5 space-y-4">
        <h3 className="th-title text-base">Trip Summary</h3>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-black/55 dark:text-white/55">Route</dt>
            <dd className="font-semibold mt-0.5">
              {source} → {destination}
            </dd>
          </div>
          <div>
            <dt className="text-black/55 dark:text-white/55">Start Date</dt>
            <dd className="font-semibold mt-0.5">
              {formatDate(trip.start_date)}
            </dd>
          </div>
          <div>
            <dt className="text-black/55 dark:text-white/55">Duration</dt>
            <dd className="font-semibold mt-0.5">
              {trip.trip_days ?? "—"} days
            </dd>
          </div>
          {trip.end_date && (
            <div>
              <dt className="text-black/55 dark:text-white/55">End Date</dt>
              <dd className="font-semibold mt-0.5">
                {formatDate(trip.end_date)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-black/55 dark:text-white/55">Travelers</dt>
            <dd className="font-semibold mt-0.5">
              {trip.adults ?? 1}{" "}
              {(trip.adults ?? 1) === 1 ? "person" : "people"}
            </dd>
          </div>
          <div>
            <dt className="text-black/55 dark:text-white/55">Interests</dt>
            <dd className="font-semibold mt-1 flex flex-wrap gap-1.5">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
};

export default ResultsSidebar;
