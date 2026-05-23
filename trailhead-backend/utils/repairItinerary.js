import { timeToMinutes, addMinutes } from "./time.js";

import {

  ensureScheduledTime,

  getScheduledEnd,

  getScheduledStart,

  setScheduledTimes,

} from "./scheduledTime.js";

export const repairItinerary = ({

  itinerary,

  activities

}) => {

  const usedIds = new Set();

  const validIds =
    new Set(
      activities.map(
        (a) => a.id
      )
    );

  itinerary.days.forEach((dayObj) => {

    dayObj.activities =
      dayObj.activities.map(
        (activity) => {

          ensureScheduledTime(
            activity
          );

          // =========================
          // INVALID ACTIVITY FIX
          // =========================

          if (
            !validIds.has(
              activity.id
            )
          ) {

            const replacement =
              activities.find(

                (a) =>
                  !usedIds.has(
                    a.id
                  )
              );

            if (replacement) {

              activity = {

                ...replacement,

                scheduledTime:
                  activity.scheduledTime
              };
            }
          }

          // =========================
          // DUPLICATE FIX
          // =========================

          if (
            usedIds.has(
              activity.id
            )
          ) {

            const replacement =
              activities.find(

                (a) =>
                  !usedIds.has(
                    a.id
                  )
              );

            if (replacement) {

              activity = {

                ...replacement,

                scheduledTime:
                  activity.scheduledTime
              };
            }
          }

          usedIds.add(
            activity.id
          );

          // =========================
          // TIME REPAIR
          // =========================

          const start =
            timeToMinutes(

              getScheduledStart(
                activity
              )
            );

          const end =
            timeToMinutes(

              getScheduledEnd(
                activity
              )
            );

          if (
            start !== null &&
            end !== null
          ) {

            const isOvernight =

              end < start &&

              start - end >= 360;

            const needsRepair =

              start === end ||

              (
                start > end &&
                !isOvernight
              );

            if (needsRepair) {

              const repairedEnd =
                addMinutes(

                  getScheduledStart(
                    activity
                  ),

                  90
                );

              if (repairedEnd) {

                setScheduledTimes(

                  activity,

                  getScheduledStart(
                    activity
                  ),

                  repairedEnd
                );
              }
            }
          }

          return activity;
      });
  });

  console.log(

    "[repairItinerary] repaired itinerary:",

    JSON.stringify(
      itinerary,
      null,
      2
    )
  );

  return itinerary;
};