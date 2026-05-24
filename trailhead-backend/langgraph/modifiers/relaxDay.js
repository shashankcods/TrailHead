export const relaxDay = ({

  itinerary,

  day
}) => {

  const targetDay =
    itinerary.days.find(
      (d) => d.day === day
    );

  if (!targetDay) {
    return itinerary;
  }

  targetDay.activities =
    targetDay.activities.slice(
      0,
      2
    );

  return itinerary;
};