const getCost = (a) => {
  const raw = a.estimatedCost ?? a.cost ?? a.price ?? 0;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
};

export const reduceBudget = ({ itinerary, activities, budgetPreference }) => {
  const targetTotal = budgetPreference ? parseFloat(budgetPreference) : null;

  // Estimate current itinerary cost by summing enriched activities
  const currentTotal = itinerary.days.reduce((sum, day) => {
    return sum + (day.activities ?? []).reduce((s, a) => s + getCost(a), 0);
  }, 0);

  // Determine per-activity cost ceiling: proportionally scale down, or default to $30
  const activityCount = itinerary.days.reduce((n, d) => n + (d.activities?.length ?? 0), 0);
  const costCeiling =
    targetTotal && currentTotal > 0 && activityCount > 0
      ? (targetTotal / currentTotal) * (currentTotal / activityCount)
      : 30;

  console.log(`[reduceBudget] targetTotal=${targetTotal}, currentTotal=${currentTotal}, activityCount=${activityCount}, costCeiling=${costCeiling}`);
  console.log(`[reduceBudget] itinerary activity costs:`, itinerary.days.flatMap(d => (d.activities ?? []).map(a => ({ title: a.title ?? a.name ?? a.activityId, cost: getCost(a) }))));

  const cheapPool = activities.filter((a) => getCost(a) <= costCeiling);

  console.log(`[reduceBudget] cheapPool size: ${cheapPool.length} / ${activities.length}`);

  if (!cheapPool.length) {
    console.warn("[reduceBudget] No activities found under cost ceiling; skipping.");
    return itinerary;
  }

  const usedIds = new Set();

  const pickCheap = () => {
    const unused = cheapPool.filter(
      (a) => !usedIds.has(a.id) && !usedIds.has(a.activityId)
    );
    const pool = unused.length ? unused : cheapPool;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  itinerary.days.forEach((day) => {
    day.activities = (day.activities ?? []).map((activity) => {
      const activityCost = getCost(activity);
      // Only replace activities that exceed the cost ceiling
      if (activityCost <= costCeiling) return activity;

      const replacement = pickCheap();
      if (!replacement) return activity;

      const id = replacement.id ?? replacement.activityId;
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
