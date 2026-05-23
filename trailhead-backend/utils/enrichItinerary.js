export const enrichItinerary = ({

  itinerary,

  activities

}) => {

  const activityMap =
    new Map();

  activities.forEach(
    (activity) => {

      activityMap.set(
        activity.id,
        activity
      );
    }
  );

  return {

    ...itinerary,

    days:
      itinerary.days.map(
        (day) => ({

          ...day,

          activities:
            day.activities.map(
              (scheduled) => {

                // =========================
                // ALREADY ENRICHED
                // =========================

                if (
                  scheduled.title &&
                  scheduled.category
                ) {

                  return scheduled;
                }

                // =========================
                // RAW FORMAT
                // =========================

                const activity =
                  activityMap.get(

                    scheduled.id ||
                    scheduled.activityId
                  );

                if (!activity) {

                  return scheduled;
                }

                return {

                  ...activity,

                  scheduledTime: {

                    start:

                      scheduled
                        .scheduledTime
                        ?.start ??

                      scheduled.start,

                    end:

                      scheduled
                        .scheduledTime
                        ?.end ??

                      scheduled.end,
                  },
                };
              }
            )
        })
      )
  };
};