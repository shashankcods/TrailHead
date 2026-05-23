import { timeToMinutes } from "./time.js";
import {
  ensureScheduledTime,
  getScheduledEnd,
  getScheduledStart,
} from "./scheduledTime.js";

export const validateItinerary = ({ itinerary, activities }) => {
  const errors = [];
  const warnings = [];

  if (!itinerary || !Array.isArray(itinerary.days)) {
    errors.push("Invalid itinerary structure");

    console.log("[validateItinerary] errors:", errors);

    return {
      valid: false,
      errors,
      warnings,
    };
  }

  const validActivityIds = new Set(
    activities.map((activity) => activity.id)
  );

  const usedIds = new Set();

  itinerary.days.forEach((dayObj, dayIndex) => {
    if (typeof dayObj.day !== "number") {
      errors.push(`Missing day number at index ${dayIndex}`);
    }

    if (!dayObj.theme) {
      errors.push(`Missing theme on day ${dayObj.day}`);
    }

    if (!Array.isArray(dayObj.activities)) {
      errors.push(`Missing activities on day ${dayObj.day}`);
      return;
    }

    dayObj.activities.forEach((activity) => ensureScheduledTime(activity));

    const sortedActivities = [...dayObj.activities].sort((a, b) => {
      return (
        timeToMinutes(getScheduledStart(a)) -
        timeToMinutes(getScheduledStart(b))
      );
    });

    sortedActivities.forEach((activity, activityIndex) => {
      if (!activity.id) {
        errors.push(
          `Missing id in activity ${activityIndex + 1} on day ${dayObj.day}`
        );
      }

      const scheduledStart = getScheduledStart(activity);
      const scheduledEnd = getScheduledEnd(activity);

      if (!scheduledStart) {
        errors.push(
          `Missing scheduledTime.start in activity ${activityIndex + 1} on day ${dayObj.day}`
        );
      }

      if (!scheduledEnd) {
        errors.push(
          `Missing scheduledTime.end in activity ${activityIndex + 1} on day ${dayObj.day}`
        );
      }

      if (!validActivityIds.has(activity.id)) {
        errors.push(
          `Invalid id "${activity.id}" on day ${dayObj.day}`
        );
      }

      const start = timeToMinutes(scheduledStart);
      const end = timeToMinutes(scheduledEnd);

      if (start === null || end === null) {
        errors.push(`Invalid time format on day ${dayObj.day}`);
        return;
      }

      const isOvernight =
        end < start &&
        start - end >= 360;

      if (!isOvernight && start >= end) {
        errors.push(
          `Invalid timing for activity "${activity.id}" on day ${dayObj.day}`
        );
      }

      if (usedIds.has(activity.id)) {
        warnings.push(
          `Repeated activity "${activity.id}" across itinerary`
        );
      }

      usedIds.add(activity.id);
    });

    for (let i = 1; i < sortedActivities.length; i++) {
      const prev = sortedActivities[i - 1];
      const curr = sortedActivities[i];

      let prevEnd = timeToMinutes(getScheduledEnd(prev));
      const prevStart = timeToMinutes(getScheduledStart(prev));
      let currStart = timeToMinutes(getScheduledStart(curr));

      if (prevEnd === null || prevStart === null || currStart === null) {
        continue;
      }

      if (prevEnd < prevStart) {
        prevEnd += 24 * 60;
      }

      if (currStart < prevStart) {
        currStart += 24 * 60;
      }

      if (prevEnd > currStart) {
        errors.push(`Overlapping activities on day ${dayObj.day}`);
      }
    }
  });

  const result = {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedItinerary: itinerary,
  };

  if (!result.valid) {
    console.log("[validateItinerary] validation failed");
    console.log("[validateItinerary] errors:", errors);
    console.log("[validateItinerary] warnings:", warnings);
  } else {
    console.log("[validateItinerary] validation passed");
  }

  return result;
};
