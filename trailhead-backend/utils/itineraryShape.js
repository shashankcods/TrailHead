// =========================
// Itinerary shape helpers
// =========================

export const getDaysArray = (itinerary) => {
  if (!itinerary) return [];
  if (Array.isArray(itinerary)) return itinerary;
  if (Array.isArray(itinerary.days)) return itinerary.days;
  if (Array.isArray(itinerary.itinerary)) return itinerary.itinerary;
  if (Array.isArray(itinerary.itinerary?.days)) {
    return itinerary.itinerary.days;
  }
  return [];
};

export const normalizeItineraryShape = (itinerary) => {
  const days = getDaysArray(itinerary).map((rawDay, index) => {
    const day = rawDay && typeof rawDay === "object" ? { ...rawDay } : {};
    const dayNumber =
      typeof day.day === "number"
        ? day.day
        : typeof day.dayNumber === "number"
          ? day.dayNumber
          : index + 1;

    const theme =
      day.theme ||
      day.title ||
      day.name ||
      `Day ${dayNumber}`;

    const activities = Array.isArray(day.activities)
      ? day.activities.map((activity) =>
          activity && typeof activity === "object" ? { ...activity } : activity
        )
      : [];

    return {
      ...day,
      day: dayNumber,
      theme,
      title: day.title || theme,
      activities,
    };
  });

  return { days };
};
