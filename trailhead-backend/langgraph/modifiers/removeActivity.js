export const removeActivity = ({ itinerary, targetActivityId, targetActivityTitle }) => {
  itinerary.days.forEach((day) => {
    day.activities = day.activities.filter((a) => {
      const idMatch =
        targetActivityId &&
        (a.activityId === targetActivityId || a.id === targetActivityId);
      const titleMatch =
        targetActivityTitle &&
        (a.title ?? a.name ?? "").toLowerCase().includes(targetActivityTitle.toLowerCase());
      return !idMatch && !titleMatch;
    });
  });
  return itinerary;
};