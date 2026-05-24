export const addFood = ({

  itinerary,

  activities
}) => {

  const restaurants =
    activities.filter((a) => {

      return (
        a.sourceType ===
        "restaurant"
      );
    });

  if (!restaurants.length) {
    return itinerary;
  }

  const restaurant =
    restaurants[
      Math.floor(
        Math.random() *
        restaurants.length
      )
    ];

  itinerary.days[0].activities.push({
    activityId: restaurant.id,
    scheduledTime: {
      start: "13:00",
      end: "14:30",
    },
  });

  return itinerary;
};