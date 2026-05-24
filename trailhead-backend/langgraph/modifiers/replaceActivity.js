export const replaceActivity = ({

  itinerary,

  activities,

  targetActivityId,

  replacementStyle
}) => {

  console.log(
    "TARGET ACTIVITY:",
    targetActivityId
  );

  console.log(
    "REPLACEMENT STYLE:",
    replacementStyle
  );

  const scored =
    activities.map((a) => {

      if (
        a.id ===
        targetActivityId
      ) {

        return {

          activity: a,

          score: -999
        };
      }

      let score = 0;

      const searchable =
        `

${a.title || ""}
${a.category || ""}
${a.tags?.join(" ") || ""}
${a.description || ""}
${a.sourceType || ""}

`
        .toLowerCase();

      // =========================
      // FUN STYLE
      // =========================

      if (
        replacementStyle === "fun"
      ) {

        if (
          searchable.includes(
            "nightlife"
          )
        ) score += 6;

        if (
          searchable.includes(
            "cruise"
          )
        ) score += 6;

        if (
          searchable.includes(
            "bar"
          )
        ) score += 5;

        if (
          searchable.includes(
            "club"
          )
        ) score += 5;

        if (
          searchable.includes(
            "experience"
          )
        ) score += 4;

        if (
          searchable.includes(
            "museum"
          )
        ) score -= 5;
      }

      // =========================
      // NIGHTLIFE STYLE
      // =========================

      if (
        replacementStyle ===
        "nightlife"
      ) {

        if (
          searchable.includes(
            "nightlife"
          )
        ) score += 7;

        if (
          searchable.includes(
            "bar"
          )
        ) score += 6;

        if (
          searchable.includes(
            "club"
          )
        ) score += 6;

        if (
          searchable.includes(
            "pub"
          )
        ) score += 5;

        if (
          searchable.includes(
            "restaurant"
          )
        ) score += 2;

        if (
          searchable.includes(
            "museum"
          )
        ) score -= 6;
      }

      // =========================
      // RELAXED STYLE
      // =========================

      if (
        replacementStyle ===
        "relaxed"
      ) {

        if (
          searchable.includes(
            "park"
          )
        ) score += 5;

        if (
          searchable.includes(
            "cafe"
          )
        ) score += 5;

        if (
          searchable.includes(
            "museum"
          )
        ) score += 2;

        if (
          searchable.includes(
            "club"
          )
        ) score -= 5;
      }

      // =========================
      // CHEAP STYLE
      // =========================

      if (
        replacementStyle ===
        "cheap"
      ) {

        const minCost =
          a.estimatedCost?.min || 0;

        if (minCost <= 10) {
          score += 6;
        }

        if (minCost <= 20) {
          score += 3;
        }
      }

      return {

        activity: a,

        score
      };
    });

  scored.sort(
    (a, b) =>
      b.score - a.score
  );

  console.log(
    "TOP REPLACEMENTS:",
    scored.slice(0, 5)
  );

  const replacement =
    scored[0]?.activity;

  console.log(
    "SELECTED REPLACEMENT:",
    replacement
  );

  if (!replacement) {

    console.log(
      "NO REPLACEMENT FOUND"
    );

    return itinerary;
  }

  itinerary.days.forEach((day) => {

    day.activities =
      day.activities.map(
        (activity) => {

          if (
            activity.id !==
            targetActivityId
          ) {

            return activity;
          }

          console.log(
            "REPLACING:",
            activity.title,
            "WITH:",
            replacement.title
          );

          return {

            ...replacement,

            scheduledTime:
              activity.scheduledTime
          };
        }
      );
  });

  console.log(
    "FINAL ITINERARY:",
    JSON.stringify(
      itinerary,
      null,
      2
    )
  );

  return itinerary;
};