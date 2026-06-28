import { timeToMinutes, minutesToTime } from "../../utils/time.js";

const NIGHTLIFE_DURATION = 120;
const NIGHT_START = 20 * 60; // 20:00 earliest
const DAY_END = 25 * 60;     // 01:00 next day (as minutes past midnight, extended)

const findNightSlot = (activities, afterActivityId) => {
  // If a specific activity is referenced, start after it ends
  if (afterActivityId) {
    const anchor = activities.find(
      (a) => a.id === afterActivityId || a.activityId === afterActivityId
    );
    if (anchor) {
      const anchorEnd = timeToMinutes(anchor.scheduledTime?.end);
      if (anchorEnd !== null) {
        const slotStart = Math.max(anchorEnd, NIGHT_START);
        return {
          start: minutesToTime(slotStart),
          end: minutesToTime(slotStart + NIGHTLIFE_DURATION),
        };
      }
    }
  }

  // Otherwise find the first free gap from 20:00 onward
  const eveningActivities = activities
    .map((a) => ({
      start: timeToMinutes(a.scheduledTime?.start),
      end: timeToMinutes(a.scheduledTime?.end),
    }))
    .filter((a) => a.start !== null && a.end !== null && a.end > NIGHT_START)
    .sort((a, b) => a.start - b.start);

  let cursor = NIGHT_START;
  for (const act of eveningActivities) {
    if (act.start > cursor + NIGHTLIFE_DURATION) break; // gap found before this activity
    if (act.end > cursor) cursor = act.end;
  }

  if (cursor + NIGHTLIFE_DURATION <= DAY_END) {
    return {
      start: minutesToTime(cursor),
      end: minutesToTime(cursor + NIGHTLIFE_DURATION),
    };
  }

  return null;
};

const NIGHTLIFE_KEYWORDS = [
  "nightlife", "bar", "club", "lounge", "pub", "cocktail",
  "entertainment", "jazz", "comedy", "rooftop", "speakeasy",
];

const isNightlifeActivity = (a) => {
  const fields = [a.category, a.sourceType, a.type, a.name, a.title]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  return NIGHTLIFE_KEYWORDS.some((kw) => fields.some((f) => f.includes(kw)));
};

export const addNightlife = ({ itinerary, activities, day, afterActivityId }) => {
  const nightlife = activities.filter(isNightlifeActivity);

  console.log(
    `[addNightlife] found ${nightlife.length} nightlife candidates from ${activities.length} total activities`
  );

  if (!nightlife.length) return itinerary;

  const targetIndex = day != null ? day - 1 : itinerary.days.length - 1;
  const dayObj = itinerary.days[targetIndex] ?? itinerary.days[itinerary.days.length - 1];
  if (!dayObj) return itinerary;

  const slot = findNightSlot(dayObj.activities ?? [], afterActivityId);
  if (!slot) {
    console.warn("[addNightlife] No free night slot found; skipping.");
    return itinerary;
  }

  const usedIds = new Set(
    itinerary.days.flatMap((d) =>
      (d.activities ?? []).flatMap((a) => [a.id, a.activityId].filter(Boolean))
    )
  );

  const selected =
    nightlife.find((a) => !usedIds.has(a.id) && !usedIds.has(a.activityId)) ??
    nightlife[0];

  dayObj.activities.push({
    activityId: selected.id ?? selected.activityId,
    scheduledTime: slot,
  });

  return itinerary;
};
