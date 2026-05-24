export const addNightlife = ({

  itinerary,

  activities
}) => {

  const nightlife =
    activities.filter((a) => {

      return (
        a.category
          ?.toLowerCase()
          .includes(
            "nightlife"
          )
      );
    });

  if (!nightlife.length) {
    return itinerary;
  }

  const selected =
    nightlife[
      Math.floor(
        Math.random() *
        nightlife.length
      )
    ];

  const lastDay =
    itinerary.days[
      itinerary.days.length - 1
    ];

  lastDay.activities.push({
    activityId: selected.id,
    scheduledTime: {
      start: "21:00",
      end: "01:00",
    },
  });

  return itinerary;
};