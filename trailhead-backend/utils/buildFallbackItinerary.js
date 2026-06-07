const DAY_THEMES = [
  "Arrival & City Introduction",
  "Highlights & Local Culture",
  "Food & Neighborhood Exploration",
  "Landmarks & Scenic Views",
  "Relaxation & Free Time",
  "Hidden Gems & Local Favorites",
  "Farewell & Last Highlights",
];

const TIME_SLOTS = [
  { start: "09:00", end: "10:30" },
  { start: "11:30", end: "13:00" },
  { start: "14:30", end: "16:00" },
  { start: "18:00", end: "20:00" },
];

const MAX_ACTIVITIES_PER_DAY = 4;

const pickActivityFields = (activity) => ({
  id: activity.id,
  activityId: activity.id ?? activity.activityId,
  title: activity.title ?? activity.name,
  name: activity.name ?? activity.title,
  sourceType: activity.sourceType,
  category: activity.category,
  tags: activity.tags,
  rating: activity.rating,
  estimatedCost: activity.estimatedCost,
  durationMinutes: activity.durationMinutes,
  recommendedVisitTime: activity.recommendedVisitTime,
  address: activity.address,
  coordinates: activity.coordinates,
  openNow: activity.openNow,
  description: activity.description ?? activity.summary,
  summary: activity.summary ?? activity.description,
  imageUrl: activity.imageUrl ?? activity.image,
  website: activity.website,
});

const toScheduledActivity = (activity, slotIndex) => {
  const slot = TIME_SLOTS[slotIndex % TIME_SLOTS.length];

  return {
    ...pickActivityFields(activity),
    scheduledTime: {
      start: slot.start,
      end: slot.end,
    },
  };
};

export const buildFallbackItinerary = ({
  trip_days = 1,
  destination = "your destination",
  activities = [],
}) => {
  const safeTripDays = Math.max(1, Number(trip_days) || 1);
  const pool = Array.isArray(activities) ? [...activities] : [];
  const dayBuckets = Array.from({ length: safeTripDays }, () => []);

  pool.forEach((activity, index) => {
    const dayIndex = index % safeTripDays;
    if (dayBuckets[dayIndex].length < MAX_ACTIVITIES_PER_DAY) {
      dayBuckets[dayIndex].push(activity);
    }
  });

  const days = Array.from({ length: safeTripDays }, (_, index) => {
    const dayNumber = index + 1;
    const theme = DAY_THEMES[index % DAY_THEMES.length];
    const dayActivities = dayBuckets[index].map((activity, activityIndex) =>
      toScheduledActivity(activity, activityIndex)
    );

    return {
      day: dayNumber,
      theme,
      title: theme,
      summary:
        dayActivities.length > 0
          ? `Curated stops across ${destination} for day ${dayNumber}.`
          : index === 0
            ? "Start your trip with a relaxed overview of the destination."
            : `Open day ${dayNumber} in ${destination}. Add activities or explore freely.`,
      activities: dayActivities,
    };
  });

  return { days };
};
