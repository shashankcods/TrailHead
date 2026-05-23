export const repairItinerary = ({

  itinerary,

  activities
}) => {

  const usedIds =
    new Set();

  const validIds =
    new Set(
      activities.map(
        (a) => a.id
      )
    );

  itinerary.days.forEach(
    (dayObj) => {

      dayObj.activities.forEach(
        (activity, index) => {

          if (
            !validIds.has(
              activity.activityId
            )
          ) {

            const replacement =
              activities.find(
                (a) =>
                  !usedIds.has(a.id)
              );

            if (replacement) {

              activity.activityId =
                replacement.id;
            }
          }

          if (
            usedIds.has(
              activity.activityId
            )
          ) {

            const replacement =
              activities.find(
                (a) =>
                  !usedIds.has(a.id)
              );

            if (replacement) {

              activity.activityId =
                replacement.id;
            }
          }

          usedIds.add(
            activity.activityId
          );

          const start =
            timeToMinutes(
              activity.start
            );

          const end =
            timeToMinutes(
              activity.end
            );

          if (
            start !== null &&
            end !== null &&
            start >= end
          ) {

            activity.end =
              addMinutes(
                activity.start,
                90
              );
          }
        }
      );
    }
  );

  return itinerary;
};