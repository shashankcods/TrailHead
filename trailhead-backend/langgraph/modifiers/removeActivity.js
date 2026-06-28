export const removeActivity = ({

  itinerary,

  targetActivityId
}) => {

  itinerary.days.forEach((day) => {

    day.activities =
      day.activities.filter(
        (a) => {

          return (
            a.activityId !== targetActivityId &&
            a.id !== targetActivityId
          );
        }
      );
  });

  return itinerary;
};