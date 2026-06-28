export const replaceActivity = ({
  itinerary,
  activities,
  targetActivityId,
  replacementStyle,
}) => {
  const scored = activities.map((a) => {
    if (a.id === targetActivityId || a.activityId === targetActivityId) {
      return { activity: a, score: -999 };
    }

    let score = 0;
    const searchable = [a.title, a.category, a.tags?.join(" "), a.description, a.sourceType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (replacementStyle === "fun") {
      if (searchable.includes("nightlife")) score += 6;
      if (searchable.includes("cruise"))    score += 6;
      if (searchable.includes("bar"))       score += 5;
      if (searchable.includes("club"))      score += 5;
      if (searchable.includes("experience"))score += 4;
      if (searchable.includes("museum"))    score -= 5;
    }

    if (replacementStyle === "nightlife") {
      if (searchable.includes("nightlife")) score += 7;
      if (searchable.includes("bar"))       score += 6;
      if (searchable.includes("club"))      score += 6;
      if (searchable.includes("pub"))       score += 5;
      if (searchable.includes("restaurant"))score += 2;
      if (searchable.includes("museum"))    score -= 6;
    }

    if (replacementStyle === "relaxed") {
      if (searchable.includes("park"))   score += 5;
      if (searchable.includes("cafe"))   score += 5;
      if (searchable.includes("museum")) score += 2;
      if (searchable.includes("club"))   score -= 5;
    }

    if (replacementStyle === "cheap") {
      const minCost = a.estimatedCost?.min || 0;
      if (minCost <= 10) score += 6;
      if (minCost <= 20) score += 3;
    }

    return { activity: a, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const replacement = scored[0]?.activity;
  if (!replacement) return itinerary;

  const usedIds = new Set(
    itinerary.days.flatMap((d) =>
      (d.activities ?? []).flatMap((a) => [a.id, a.activityId].filter(Boolean))
    )
  );

  itinerary.days.forEach((day) => {
    day.activities = day.activities.map((activity) => {
      const actId = activity.id ?? activity.activityId;
      if (actId !== targetActivityId) return activity;

      // Pick the best-scored replacement not already in the itinerary
      const candidate =
        scored.find(
          ({ activity: a, score }) =>
            score > -999 &&
            !usedIds.has(a.id) &&
            !usedIds.has(a.activityId)
        )?.activity ?? replacement;

      const id = candidate.id ?? candidate.activityId;
      usedIds.add(id);

      // Return raw format so enrichItinerary hydrates the full data
      return {
        activityId: id,
        scheduledTime: activity.scheduledTime,
      };
    });
  });

  return itinerary;
};
