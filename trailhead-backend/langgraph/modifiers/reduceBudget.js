export const reduceBudget = ({

  itinerary,

  activities
}) => {

  const cheapActivities =
    activities.filter((a) => {

      return (
        (a.estimatedCost || 0)
        <= 20
      );
    });

  itinerary.days.forEach((day) => {

    day.activities.forEach(
      (activity) => {

        const replacement =
          cheapActivities[
            Math.floor(
              Math.random() *
              cheapActivities.length
            )
          ];

        if (replacement) {

          activity.activityId =
            replacement.id;
        }
      }
    );
  });

  return itinerary;
};