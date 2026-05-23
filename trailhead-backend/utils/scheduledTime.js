/**
 * Helpers for the enriched itinerary activity time shape:
 * activity.scheduledTime.start / activity.scheduledTime.end
 */

export const getScheduledStart = (activity) =>
  activity?.scheduledTime?.start ??
  activity?.start ??
  null;

export const getScheduledEnd = (activity) =>
  activity?.scheduledTime?.end ??
  activity?.end ??
  null;

/**
 * Ensure scheduledTime exists; migrate legacy top-level start/end if present.
 */
export const ensureScheduledTime = (activity) => {
  if (!activity) {
    return activity;
  }

  const start = getScheduledStart(activity);
  const end = getScheduledEnd(activity);

  activity.scheduledTime = {
    start,
    end,
  };

  delete activity.start;
  delete activity.end;

  return activity;
};

export const setScheduledTimes = (activity, start, end) => {
  if (!activity.scheduledTime) {
    activity.scheduledTime = {};
  }

  activity.scheduledTime.start = start;
  activity.scheduledTime.end = end;

  delete activity.start;
  delete activity.end;

  return activity;
};
