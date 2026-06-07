export const enrichItinerary = ({

  itinerary,

  activityMap

}) => {

  if (!itinerary || !Array.isArray(itinerary.days)) {

    return { days: [] };
  }

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