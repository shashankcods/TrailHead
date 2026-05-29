import React from "react";
import ActivityDetailCard from "@/components/results/ActivityDetailCard";
import type { NormalizedDay } from "@/components/results/itineraryUtils";

interface ItineraryDayPanelProps {
  day: NormalizedDay;
}

const ItineraryDayPanel: React.FC<ItineraryDayPanelProps> = ({ day }) => {
  const getBucket = (time?: string) => {
    if (!time) return "afternoon";
    const lower = time.toLowerCase();
    const match = lower.match(/(\d{1,2})/);
    if (!match) return "afternoon";
    const rawHour = Number(match[1]);
    if (!Number.isFinite(rawHour)) return "afternoon";
    const hour =
      lower.includes("pm") && rawHour < 12
        ? rawHour + 12
        : lower.includes("am") && rawHour === 12
        ? 0
        : rawHour;
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const morning = day.activities.filter(
    (activity) => getBucket(activity.scheduledStart) === "morning"
  );
  const afternoon = day.activities.filter(
    (activity) => getBucket(activity.scheduledStart) === "afternoon"
  );
  const evening = day.activities.filter(
    (activity) => getBucket(activity.scheduledStart) === "evening"
  );

  const groups = [
    { label: "Morning", items: morning },
    { label: "Afternoon", items: afternoon },
    { label: "Evening", items: evening },
  ].filter((group) => group.items.length > 0);

  return (
    <section
      id={day.id}
      className="scroll-mt-24 rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 shadow-sm p-5 md:p-7 space-y-5"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55">
          Day {day.dayNumber}
          {day.date ? ` · ${day.date}` : ""}
        </p>
        <h3 className="text-2xl font-extrabold leading-tight">{day.title}</h3>
        {(day.subtitle || day.summary) && (
          <p className="text-sm text-black/65 dark:text-white/65">
            {day.subtitle ?? day.summary}
          </p>
        )}
      </header>

      {day.activities.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No activities scheduled for this day.
        </p>
      ) : groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-black/60 dark:text-white/60">
                {group.label}
              </h4>
              <div className="space-y-3">
                {group.items.map((activity) => (
                  <ActivityDetailCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {day.activities.map((activity) => (
            <ActivityDetailCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ItineraryDayPanel;
