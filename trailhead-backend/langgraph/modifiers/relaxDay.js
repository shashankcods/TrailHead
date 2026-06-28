export const relaxDay = ({ itinerary, day }) => {
  const targetDayNum = Number(day);

  const targetDay = itinerary.days.find(
    (d) => Number(d.day) === targetDayNum || Number(d.dayNumber) === targetDayNum
  );

  if (!targetDay) return itinerary;

  // Keep only the first 2 activities (least packed = most relaxed)
  targetDay.activities = targetDay.activities.slice(0, 2);

  return itinerary;
};
