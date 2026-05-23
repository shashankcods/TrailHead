const timeToMinutes = (time) => {

  if (
    !time ||
    typeof time !== "string"
  ) {
    return null;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return (
    hours * 60 + minutes
  );
};

export const validateItinerary = ({
  itinerary,
  activities
}) => {

  const errors = [];
  const warnings = [];

  if (
    !itinerary ||
    !Array.isArray(itinerary.days)
  ) {
    errors.push(
      "Invalid itinerary structure"
    );

    return {
      valid: false,
      errors,
      warnings
    };
  }

  const validActivityIds =
    new Set(
      activities.map(
        (activity) => activity.id
      )
    );

  const usedIds = new Set();

  itinerary.days.forEach((dayObj, dayIndex) => {

    if (typeof dayObj.day !== "number") {
      errors.push(
        `Missing day number at index ${dayIndex}`
      );
    }

    if (!dayObj.theme) {
      errors.push(
        `Missing theme on day ${dayObj.day}`
      );
    }

    if (
      !Array.isArray(dayObj.activities)
    ) {
      errors.push(
        `Missing activities on day ${dayObj.day}`
      );

      return;
    }

    const sortedActivities =
      [...dayObj.activities].sort((a, b) => {

        return (
          timeToMinutes(a.start) -
          timeToMinutes(b.start)
        );
      });

    sortedActivities.forEach(
      (activity, activityIndex) => {

        if (!activity.activityId) {
          errors.push(
            `Missing activityId in activity ${activityIndex + 1} on day ${dayObj.day}`
          );
        }

        if (!activity.start) {
          errors.push(
            `Missing start time in activity ${activityIndex + 1} on day ${dayObj.day}`
          );
        }

        if (!activity.end) {
          errors.push(
            `Missing end time in activity ${activityIndex + 1} on day ${dayObj.day}`
          );
        }

        if (
          !validActivityIds.has(
            activity.activityId
          )
        ) {
          errors.push(
            `Invalid activityId "${activity.activityId}" on day ${dayObj.day}`
          );
        }

        const start =
          timeToMinutes(activity.start);

        const end =
          timeToMinutes(activity.end);

        if (
          start === null ||
          end === null
        ) {
          errors.push(
            `Invalid time format on day ${dayObj.day}`
          );

          return;
        }

        if (start >= end) {

          let adjustedEnd = end;

          if (end < start) {

            adjustedEnd += 24 * 60;
          }

          if (start >= adjustedEnd) {

            errors.push(
              `Invalid timing for activity "${activity.activityId}" on day ${dayObj.day}`
            );
          }
        }

        if (
          usedIds.has(activity.activityId)
        ) {
          warnings.push(
            `Repeated activity "${activity.activityId}" across itinerary`
          );
        }

        usedIds.add(activity.activityId);
      }
    );

    for (
      let i = 1;
      i < sortedActivities.length;
      i++
    ) {

      const prev =
        sortedActivities[i - 1];

      const curr =
        sortedActivities[i];

      let prevEnd =
        timeToMinutes(prev.end);

      const prevStart =
        timeToMinutes(prev.start);

      let currStart =
        timeToMinutes(curr.start);

      if (prevEnd < prevStart) {

        prevEnd += 24 * 60;
      }

      if (currStart < prevStart) {

        currStart += 24 * 60;
      }

      if (prevEnd > currStart) {

        errors.push(
          `Overlapping activities on day ${dayObj.day}`
        );
      }
    }
  });

  return {

    valid:
      errors.length === 0,

    errors,

    warnings,

    normalizedItinerary:
      itinerary
  };
};