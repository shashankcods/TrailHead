import { timeToMinutes, addMinutes } from "./time.js";
import {
  ensureScheduledTime,
  getScheduledEnd,
  getScheduledStart,
  setScheduledTimes,
} from "./scheduledTime.js";
import { normalizeItineraryShape } from "./itineraryShape.js";

export const repairItinerary = ({
  itinerary,
  activities,
  activityMap,
}) => {
  const normalized = normalizeItineraryShape(itinerary);
  const days = normalized.days;

  if (!days.length) {
    console.warn(
      "[repairItinerary] No days to repair; returning empty itinerary."
    );
    return { days: [] };
  }

  if (!Array.isArray(activities) || !activityMap) {
    console.warn(
      "[repairItinerary] Missing activities or activityMap; returning normalized itinerary."
    );
    return normalized;
  }

  const usedIds = new Set();

  const getUnusedActivity = () =>
    activities.find((activity) => !usedIds.has(activity.id));

  days.forEach((dayObj) => {
    if (!Array.isArray(dayObj.activities)) {
      dayObj.activities = [];
      return;
    }

    dayObj.activities = dayObj.activities.map((activity) => {
      ensureScheduledTime(activity);

      const activityId = activity.id || activity.activityId;

      if (!activityId || !activityMap.has(activityId)) {
        const replacement = getUnusedActivity();

        if (replacement) {
          activity = {
            ...replacement,
            scheduledTime: activity.scheduledTime,
          };
        }
      }

      const updatedActivityId = activity.id || activity.activityId;

      if (updatedActivityId && usedIds.has(updatedActivityId)) {
        const replacement = getUnusedActivity();

        if (replacement) {
          activity = {
            ...replacement,
            scheduledTime: activity.scheduledTime,
          };
        }
      }

      const finalActivityId = activity.id || activity.activityId;

      if (finalActivityId) {
        usedIds.add(finalActivityId);
      }

      const start = timeToMinutes(getScheduledStart(activity));
      const end = timeToMinutes(getScheduledEnd(activity));

      if (start !== null && end !== null) {
        const isOvernight = end < start && start - end >= 360;
        const needsRepair =
          start === end || (start > end && !isOvernight);

        if (needsRepair) {
          const repairedEnd = addMinutes(getScheduledStart(activity), 90);

          if (repairedEnd) {
            setScheduledTimes(
              activity,
              getScheduledStart(activity),
              repairedEnd
            );
          }
        }
      }

      return activity;
    });
  });

  console.log(
    "[repairItinerary] repaired itinerary:",
    JSON.stringify(normalized, null, 2)
  );

  return normalized;
};
