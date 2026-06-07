import React, { useEffect, useMemo, useState } from "react";
import type { PlannerData } from "@/types/planner";
import ItineraryDayPanel from "@/components/results/ItineraryDayPanel";
import TravelView from "@/components/results/TravelView";
import {
  countItineraryActivities,
  normalizePlannerItinerary,
} from "@/components/results/itineraryUtils";

const NAV_TABS = ["Timeline", "Itinerary", "Travel", "Hotels", "Overview", "Map"] as const;
type DetailedItineraryTab = "Timeline" | "Itinerary" | "Travel";
const ENABLED_TABS: DetailedItineraryTab[] = ["Timeline", "Itinerary", "Travel"];

interface DetailedItineraryProps {
  plannerData: PlannerData;
  onBack: () => void;
  onOpenChat: () => void;
}

const DetailedItinerary: React.FC<DetailedItineraryProps> = ({
  plannerData,
  onBack,
  onOpenChat,
}) => {
  const normalizedDays = useMemo(() => normalizePlannerItinerary(plannerData), [plannerData]);
  const [activeDayId, setActiveDayId] = useState<string>(normalizedDays[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<DetailedItineraryTab>("Timeline");
  const showDayNav = activeTab !== "Travel";
  const trip = plannerData.trip ?? {};
  const activityCount = countItineraryActivities(normalizedDays);

  useEffect(() => {
    if (!normalizedDays.length) return;
    setActiveDayId(normalizedDays[0].id);
  }, [normalizedDays]);

  useEffect(() => {
  if (!normalizedDays.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) -
            Math.abs(b.boundingClientRect.top)
        );

      const closestVisible = visibleEntries[0];

      if (closestVisible?.target?.id) {
        setActiveDayId(closestVisible.target.id);
      }
    },
    {
      root: null,
      rootMargin: "-120px 0px -60% 0px",
      threshold: [0.1, 0.25, 0.5],
    }
  );

  normalizedDays.forEach((day) => {
    const element = document.getElementById(day.id);
    if (element) observer.observe(element);
  });

  return () => observer.disconnect();
}, [normalizedDays]);

  const scrollToSection = (id: string) => {
  setActiveDayId(id);

  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

  return (
    <section id="itinerary-section" className="space-y-5 scroll-mt-24">
      <header className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 p-5 md:p-6 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {(trip.source || "Source") + " → " + (trip.destination || "Destination")}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1">
              {trip.trip_days ?? normalizedDays.length} days
            </span>
            <span className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1">
              {trip.adults ?? 1} traveler{(trip.adults ?? 1) > 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1">
              {activityCount} activities
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-4 py-2.5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-sm font-bold"
          >
            Back to Results
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="rounded-xl px-4 py-2.5 border border-black/20 dark:border-white/25 text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            Save Trip
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="rounded-xl px-4 py-2.5 border border-black dark:border-white bg-white dark:bg-black text-sm font-bold hover:scale-[1.01] transition"
          >
            Open Chat
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
          <aside className="lg:sticky lg:top-24 space-y-4">
            <nav className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 p-3 shadow-sm">
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {NAV_TABS.map((tab) => {
                  const isEnabled = ENABLED_TABS.includes(tab as DetailedItineraryTab);
                  const isActive = isEnabled && activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      disabled={!isEnabled}
                      onClick={() => {
                        if (ENABLED_TABS.includes(tab as DetailedItineraryTab)) {
                          setActiveTab(tab as DetailedItineraryTab);
                        }
                      }}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold border transition ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                          : "bg-transparent border-black/10 dark:border-white/15 text-black/75 dark:text-white/75"
                      } ${!isEnabled ? "opacity-45 cursor-not-allowed" : ""}`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </nav>

            {showDayNav && normalizedDays.length > 0 && (
              <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 p-3 shadow-sm space-y-2">
                <h4 className="text-sm font-bold px-2 pt-1">Days</h4>
                {normalizedDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => scrollToSection(day.id)}
                    className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${
                      activeDayId === day.id
                        ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                        : "border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                      Day {day.dayNumber}
                    </p>
                    <p className="font-bold text-sm mt-0.5 truncate">{day.title}</p>
                    <p className="text-xs opacity-80 mt-1">
                      {day.activities.length} activit{day.activities.length === 1 ? "y" : "ies"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="space-y-4">
            {activeTab === "Travel" ? (
              <TravelView plannerData={plannerData} />
            ) : normalizedDays.length === 0 ? (
              <div className="th-soft-card p-6">
                <h4 className="font-bold text-lg">Detailed itinerary unavailable</h4>
                <p className="th-subtitle mt-1">
                  We could not find day-wise itinerary data for this trip yet.
                </p>
              </div>
            ) : activeTab === "Timeline" ? (
              <div className="space-y-4">
                {normalizedDays.map((day) => (
                  <section
                    key={day.id}
                    id={day.id}
                    className="scroll-mt-24 rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 shadow-sm p-5 md:p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
                      Day {day.dayNumber}
                      {day.date ? ` · ${day.date}` : ""}
                    </p>
                    <h3 className="text-xl font-extrabold mt-1">{day.title}</h3>
                    <div className="mt-4 space-y-2">
                      {day.activities.length > 0 ? (
                        day.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="rounded-xl border border-black/10 dark:border-white/15 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-white/70 dark:bg-black/35"
                          >
                            <div>
                              <p className="font-semibold text-sm">{activity.title}</p>
                              <p className="text-xs text-black/60 dark:text-white/60">
                                {[activity.category, activity.sourceType]
                                  .filter(Boolean)
                                  .join(" · ") || "Activity"}
                              </p>
                            </div>
                            <span className="text-xs font-semibold rounded-lg border border-black/15 dark:border-white/20 px-2 py-1">
                              {activity.timeLabel ?? "Anytime"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-black/60 dark:text-white/60">
                          No activities scheduled for this day.
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              normalizedDays.map((day) => <ItineraryDayPanel key={day.id} day={day} />)
            )}
          </div>
        </div>
    </section>
  );
};

export default DetailedItinerary;
