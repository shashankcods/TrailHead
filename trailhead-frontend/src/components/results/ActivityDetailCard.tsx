import React, { useState } from "react";
import type { NormalizedActivity } from "@/components/results/itineraryUtils";

interface ActivityDetailCardProps {
  activity: NormalizedActivity;
}

const actionButtonClass =
  "rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25 transition hover:scale-[1.01]";

const disabledButtonClass =
  "rounded-lg px-3 py-2 text-xs font-semibold border border-black/20 dark:border-white/25 opacity-50 cursor-not-allowed";

const ActivityDetailCard: React.FC<ActivityDetailCardProps> = ({ activity }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(activity.imageUrl) && !imageError;
  const cleanTags = activity.tags
    .map((tag) => tag.replaceAll("_", " ").trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 4);

  return (
    <article className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-black/35 shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-[180px_1fr]">
        <div className="h-40 md:h-full min-h-[160px] bg-black/[0.04] dark:bg-white/[0.08] border-b md:border-b-0 md:border-r border-black/10 dark:border-white/15">
          {showImage ? (
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-black/50 dark:text-white/50 px-3 text-center">
              No image available
            </div>
          )}
        </div>

        <div className="p-4 md:p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-lg font-bold leading-tight">{activity.title}</h4>
              <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                {[activity.category, activity.sourceType].filter(Boolean).join(" · ") || "Activity"}
              </p>
            </div>
            {activity.timeLabel && (
              <span className="rounded-lg border border-black/15 dark:border-white/20 px-2.5 py-1 text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.06]">
                {activity.timeLabel}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {activity.duration && (
              <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
                Duration: {activity.duration}
              </span>
            )}
            {activity.rating != null && (
              <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
                Rating: {activity.rating}
              </span>
            )}
            {activity.estimatedCost && (
              <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
                Cost: {activity.estimatedCost}
              </span>
            )}
            {activity.openNow != null && (
              <span className="rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1">
                {activity.openNow ? "Open now" : "Closed now"}
              </span>
            )}
          </div>

          {activity.address && (
            <p className="text-sm text-black/70 dark:text-white/70">{activity.address}</p>
          )}
          {activity.description && (
            <p className="text-sm text-black/75 dark:text-white/75">{activity.description}</p>
          )}

          {(activity.crowdInfo || activity.bestTimeInfo) && (
            <p className="text-xs text-black/60 dark:text-white/60">
              {activity.crowdInfo && `Crowd: ${activity.crowdInfo}`}
              {activity.crowdInfo && activity.bestTimeInfo && " · "}
              {activity.bestTimeInfo && `Best time: ${activity.bestTimeInfo}`}
            </p>
          )}

          {cleanTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cleanTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-xs border border-black/15 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.06]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {activity.website ? (
              <a
                href={activity.website}
                target="_blank"
                rel="noreferrer"
                className={`${actionButtonClass} bg-black text-white dark:bg-white dark:text-black border-black dark:border-white`}
              >
                Website
              </a>
            ) : (
              <button type="button" disabled className={disabledButtonClass}>
                Website
              </button>
            )}

            {activity.phone ? (
              <a
                href={`tel:${activity.phone.replace(/\s/g, "")}`}
                className={actionButtonClass}
              >
                Call
              </a>
            ) : (
              <button type="button" disabled className={disabledButtonClass}>
                Call
              </button>
            )}

            {activity.directionsUrl ? (
              <a
                href={activity.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={actionButtonClass}
              >
                Directions
              </a>
            ) : (
              <button type="button" disabled className={disabledButtonClass}>
                Directions
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ActivityDetailCard;
