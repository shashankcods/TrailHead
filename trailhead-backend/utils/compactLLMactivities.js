export const compactLLMActivities = (activities = []) => {
  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    sourceType: activity.sourceType,
    category: activity.category,
    tags: activity.tags,
    rating: activity.rating,
    estimatedCost: activity.estimatedCost?.max || 0,
    durationMinutes: activity.durationMinutes,
    recommendedVisitTime: activity.recommendedVisitTime,
    openNow: activity.metadata?.openNow || null,
  }));
};