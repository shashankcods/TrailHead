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

                const activity =
                  activityMap.get(
                    scheduled.activityId
                  );

                return {

                  ...activity,

                  scheduledTime: {

                    start:
                      scheduled.start,

                    end:
                      scheduled.end
                  }
                };
              }
            )
        })
      )
  };
};