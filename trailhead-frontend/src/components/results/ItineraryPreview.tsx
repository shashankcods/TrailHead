import React from "react";
import type { PlannerData, PlannerItineraryDay } from "@/types/planner";

const formatDayDate = (startDate: string | undefined, dayNum: number) => {
  if (!startDate) return null;
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + dayNum - 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

interface ItineraryPreviewProps {
  plannerData: PlannerData;
}

const ItineraryPreview: React.FC<ItineraryPreviewProps> = ({ plannerData }) => {
  const days = plannerData.itinerary?.days ?? [];
  const startDate = plannerData.trip?.start_date;

  if (days.length === 0) {
    return (
      <section id="itinerary-section" className="th-soft-card p-6">
        <h3 className="th-title mb-2">Itinerary</h3>
        <p className="th-subtitle">No itinerary days were generated for this trip.</p>
      </section>
    );
  }

  return (
    <section id="itinerary-section" className="space-y-4">
      <div>
        <h3 className="th-title">Your Itinerary</h3>
        <p className="th-subtitle mt-1">
          Day-by-day plan with activities, times, and details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day: PlannerItineraryDay, index) => {
          const dayNum = day.day ?? index + 1;
          const dayDate =
            day.date ?? formatDayDate(startDate, dayNum) ?? undefined;
          const activities = day.activities ?? [];

          return (
            <article
              key={`${dayNum}-${index}`}
              className="th-soft-card p-5 flex flex-col gap-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
                  Day {dayNum}
                </p>
                <h4 className="text-lg font-bold mt-1">
                  {day.theme || `Day ${dayNum}`}
                </h4>
                {dayDate && (
                  <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                    {dayDate}
                  </p>
                )}
              </div>

              {activities.length > 0 ? (
                <ul className="space-y-3">
                  {activities.map((activity, actIdx) => {
                    const time =
                      activity.scheduledTime?.start &&
                      activity.scheduledTime?.end
                        ? `${activity.scheduledTime.start} – ${activity.scheduledTime.end}`
                        : activity.scheduledTime?.start || null;

                    return (
                      <li
                        key={activity.id ?? activity.activityId ?? actIdx}
                        className="rounded-xl border border-black/10 dark:border-white/15 p-3 bg-white/70 dark:bg-black/40"
                      >
                        <p className="font-semibold text-sm">
                          {activity.title || "Activity"}
                        </p>
                        {activity.category && (
                          <p className="text-xs text-black/55 dark:text-white/55 mt-0.5">
                            {activity.category}
                          </p>
                        )}
                        {time && (
                          <p className="text-xs font-medium mt-1.5">
                            {time}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-black/65 dark:text-white/65">
                          {activity.rating != null && (
                            <span>★ {activity.rating}</span>
                          )}
                          {activity.cost != null && activity.cost !== "" && (
                            <span>Cost: {String(activity.cost)}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-black/60 dark:text-white/60">
                  No activities scheduled.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ItineraryPreview;
