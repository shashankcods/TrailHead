import { timeToMinutes, minutesToTime } from "../../utils/time.js";

const MEAL_DURATION = 90;
const DAY_START = 8 * 60;
const DAY_END = 23 * 60;

const findFreeSlot = (activities) => {
  const sorted = [...activities]
    .map((a) => ({
      start: timeToMinutes(a.scheduledTime?.start),
      end: timeToMinutes(a.scheduledTime?.end),
    }))
    .filter((a) => a.start !== null && a.end !== null)
    .sort((a, b) => a.start - b.start);

  // Gap before first activity
  const firstStart = sorted[0]?.start ?? DAY_END;
  if (firstStart - DAY_START >= MEAL_DURATION) {
    return {
      start: minutesToTime(DAY_START),
      end: minutesToTime(DAY_START + MEAL_DURATION),
    };
  }

  // Gaps between consecutive activities
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = sorted[i].end;
    const gapEnd = sorted[i + 1].start;
    if (gapEnd - gapStart >= MEAL_DURATION) {
      return {
        start: minutesToTime(gapStart),
        end: minutesToTime(gapStart + MEAL_DURATION),
      };
    }
  }

  // Gap after last activity
  const lastEnd = sorted[sorted.length - 1]?.end ?? DAY_START;
  if (DAY_END - lastEnd >= MEAL_DURATION) {
    return {
      start: minutesToTime(lastEnd),
      end: minutesToTime(lastEnd + MEAL_DURATION),
    };
  }

  return null;
};

export const addFood = ({ itinerary, activities, day }) => {
  const restaurants = activities.filter((a) => a.sourceType === "restaurant");
  if (!restaurants.length) return itinerary;

  const targetIndex = day != null ? day - 1 : 0;
  const dayObj = itinerary.days[targetIndex] ?? itinerary.days[0];
  if (!dayObj) return itinerary;

  const slot = findFreeSlot(dayObj.activities ?? []);
  if (!slot) {
    console.warn("[addFood] No free gap found on day; skipping.");
    return itinerary;
  }

  const usedIds = new Set(
    itinerary.days.flatMap((d) =>
      (d.activities ?? []).flatMap((a) =>
        [a.id, a.activityId].filter(Boolean)
      )
    )
  );

  const restaurant =
    restaurants.find(
      (r) => !usedIds.has(r.id) && !usedIds.has(r.activityId)
    ) ?? restaurants[0];

  dayObj.activities.push({
    activityId: restaurant.id ?? restaurant.activityId,
    scheduledTime: slot,
  });

  return itinerary;
};
