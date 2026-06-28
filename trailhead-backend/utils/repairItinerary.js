import { timeToMinutes, minutesToTime, addMinutes } from "./time.js";
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

    // Sort by start time, then shift any overlapping activities forward
    dayObj.activities.sort((a, b) => {
      const aStart = timeToMinutes(getScheduledStart(a)) ?? 0;
      const bStart = timeToMinutes(getScheduledStart(b)) ?? 0;
      return aStart - bStart;
    });

    for (let i = 1; i < dayObj.activities.length; i++) {
      const prev = dayObj.activities[i - 1];
      const curr = dayObj.activities[i];
      const prevEnd = timeToMinutes(getScheduledEnd(prev));
      const currStart = timeToMinutes(getScheduledStart(curr));
      const currEnd = timeToMinutes(getScheduledEnd(curr));

      if (prevEnd !== null && currStart !== null && currStart < prevEnd) {
        const duration = currEnd !== null ? currEnd - currStart : 90;
        const newStart = minutesToTime(prevEnd);
        const newEnd = minutesToTime(prevEnd + duration);
        setScheduledTimes(curr, newStart, newEnd);
      }
    }
  });

  return normalized;
};
