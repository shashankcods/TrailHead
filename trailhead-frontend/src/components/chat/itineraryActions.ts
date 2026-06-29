import type { PlannerActivity, PlannerData, PlannerItineraryDay } from "@/types/planner";

export type ItineraryAction =
  | { type: "ANSWER_ONLY" }
  | { type: "REMOVE_ACTIVITY"; payload: { dayNumber?: number; fromDayNumber?: number; activityId?: string; activityTitle?: string } }
  | { type: "ADD_ACTIVITY"; payload: { dayNumber: number; activity: PlannerActivity } }
  | { type: "MOVE_ACTIVITY"; payload: { fromDayNumber: number; toDayNumber: number; timeLabel?: string; activityId?: string; activityTitle?: string } }
  | { type: "UPDATE_ACTIVITY"; payload: { dayNumber?: number; updates: Partial<PlannerActivity>; activityId?: string; activityTitle?: string } };

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
};

const activityTitle = (activity: UnknownRecord) =>
  String(activity.title ?? activity.name ?? "").trim();

const activityId = (activity: UnknownRecord) =>
  String(activity.id ?? activity.activityId ?? "").trim();

const matchesActivity = (
  activity: UnknownRecord,
  criteria: { activityId?: string; activityTitle?: string }
) => {
  if (criteria.activityId) {
    const id = activityId(activity);
    if (id && id === criteria.activityId) return true;
  }
  if (criteria.activityTitle) {
    const title = activityTitle(activity).toLowerCase();
    const needle = criteria.activityTitle.toLowerCase().trim();
    if (title && needle && (title === needle || title.includes(needle))) {
      return true;
    }
  }
  return false;
};

const getDayNumber = (day: UnknownRecord, index: number) =>
  Number(day.day ?? day.dayNumber ?? index + 1);

const clonePlannerData = (plannerData: PlannerData): PlannerData =>
  structuredClone(plannerData);

const getItineraryDays = (
  plannerData: PlannerData
): { days: PlannerItineraryDay[]; wrapped: boolean } => {
  const itinerary = plannerData.itinerary;
  if (Array.isArray(itinerary)) {
    return { days: structuredClone(itinerary), wrapped: false };
  }
  const record = asRecord(itinerary);
  const days = Array.isArray(record?.days)
    ? structuredClone(record.days as PlannerItineraryDay[])
    : [];
  return { days, wrapped: true };
};

const setItineraryDays = (
  plannerData: PlannerData,
  days: PlannerItineraryDay[],
  wrapped: boolean
): PlannerData => {
  if (wrapped) {
    const existing = asRecord(plannerData.itinerary) ?? {};
    return {
      ...plannerData,
      itinerary: { ...existing, days },
    };
  }
  return { ...plannerData, itinerary: days };
};

const findDayIndex = (days: PlannerItineraryDay[], dayNumber?: number) => {
  if (dayNumber == null) return -1;
  return days.findIndex((day, index) => getDayNumber(asRecord(day) ?? {}, index) === dayNumber);
};

const findActivityIndex = (
  activities: PlannerActivity[],
  criteria: { activityId?: string; activityTitle?: string }
) =>
  activities.findIndex((activity) =>
    matchesActivity(asRecord(activity) ?? {}, criteria)
  );

const ensureActivityId = (activity: PlannerActivity): PlannerActivity => {
  const record = asRecord(activity) ?? {};
  const id = activityId(record) || activity.activityId;
  if (id) return { ...activity, id, activityId: activity.activityId ?? id };
  const generated = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { ...activity, id: generated, activityId: generated };
};

const applyTimeLabel = (
  activity: PlannerActivity,
  timeLabel?: string
): PlannerActivity => {
  if (!timeLabel?.trim()) return activity;
  const parts = timeLabel.split(/\s*-\s*/);
  const start = parts[0]?.trim();
  const end = parts[1]?.trim();
  return {
    ...activity,
    time: start ?? timeLabel,
    startTime: start ?? timeLabel,
    endTime: end,
    scheduledTime: start
      ? { start, ...(end ? { end } : {}) }
      : activity.scheduledTime,
  };
};

const removeActivityFromDays = (
  days: PlannerItineraryDay[],
  criteria: {
    dayNumber?: number;
    activityId?: string;
    activityTitle?: string;
    fromDayNumber?: number;
  }
): { days: PlannerItineraryDay[]; removed?: PlannerActivity } => {
  const targetDay = criteria.dayNumber ?? criteria.fromDayNumber;

  for (let index = 0; index < days.length; index += 1) {
    const day = days[index];
    const dayNum = getDayNumber(asRecord(day) ?? {}, index);
    if (targetDay != null && dayNum !== targetDay) continue;

    const activities = [...(day.activities ?? [])];
    const idx = findActivityIndex(activities, criteria);
    if (idx === -1) continue;

    const removed = activities[idx];
    activities.splice(idx, 1);
    const nextDays = days.map((d, i) =>
      i === index ? { ...day, activities } : d
    );
    return { days: nextDays, removed };
  }

  return { days, removed: undefined };
};

export function applyItineraryAction(
  plannerData: PlannerData,
  action: ItineraryAction
): PlannerData {
  if (!action || action.type === "ANSWER_ONLY") {
    return plannerData;
  }

  const { days, wrapped } = getItineraryDays(plannerData);
  if (!days.length) return plannerData;

  switch (action.type) {
    case "REMOVE_ACTIVITY": {
      const { days: nextDays, removed } = removeActivityFromDays(
        days,
        action.payload
      );
      if (!removed) return plannerData;
      return setItineraryDays(clonePlannerData(plannerData), nextDays, wrapped);
    }

    case "ADD_ACTIVITY": {
      const { dayNumber, activity } = action.payload;
      const dayIndex = findDayIndex(days, dayNumber);
      if (dayIndex === -1) return plannerData;

      const nextDays = days.map((day, index) => {
        if (index !== dayIndex) return day;
        const activities = [...(day.activities ?? [])];
        activities.push(ensureActivityId(activity));
        return { ...day, activities };
      });

      return setItineraryDays(clonePlannerData(plannerData), nextDays, wrapped);
    }

    case "MOVE_ACTIVITY": {
      const { fromDayNumber, toDayNumber, timeLabel, ...criteria } = action.payload;
      const { days: afterRemove, removed } = removeActivityFromDays(days, {
        ...criteria,
        dayNumber: fromDayNumber,
        fromDayNumber,
      });
      if (!removed) return plannerData;

      const targetIndex = findDayIndex(afterRemove, toDayNumber);
      if (targetIndex === -1) return plannerData;

      const activityToAdd = applyTimeLabel(removed, timeLabel);
      const nextDays = afterRemove.map((day, index) => {
        if (index !== targetIndex) return day;
        return {
          ...day,
          activities: [...(day.activities ?? []), activityToAdd],
        };
      });

      return setItineraryDays(clonePlannerData(plannerData), nextDays, wrapped);
    }

    case "UPDATE_ACTIVITY": {
      const { dayNumber, updates, ...criteria } = action.payload;
      let updated = false;

      const nextDays = days.map((day, index) => {
        const dayNum = getDayNumber(asRecord(day) ?? {}, index);
        if (dayNumber != null && dayNum !== dayNumber) return day;

        const activities = (day.activities ?? []).map((activity) => {
          if (!matchesActivity(asRecord(activity) ?? {}, criteria)) return activity;
          updated = true;
          return { ...activity, ...updates };
        });

        return updated ? { ...day, activities } : day;
      });

      if (!updated) return plannerData;
      return setItineraryDays(clonePlannerData(plannerData), nextDays, wrapped);
    }

    default:
      return plannerData;
  }
}

export function isMutatingAction(action?: ItineraryAction): boolean {
  return Boolean(action && action.type !== "ANSWER_ONLY");
}
