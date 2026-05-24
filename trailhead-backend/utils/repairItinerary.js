import {

  timeToMinutes,

  addMinutes

} from "./time.js";

import {

  ensureScheduledTime,

  getScheduledEnd,

  getScheduledStart,

  setScheduledTimes,

} from "./scheduledTime.js";

export const repairItinerary = ({

  itinerary,

  activities,

  activityMap

}) => {

  const usedIds =
    new Set();

  // =========================
  // PICK UNUSED ACTIVITY
  // =========================

  const getUnusedActivity =
    () => {

      return activities.find(

        (a) =>

          !usedIds.has(
            a.id
          )
      );
  };

  itinerary.days.forEach(

    (dayObj) => {

      dayObj.activities =
        dayObj.activities.map(

          (activity) => {

            ensureScheduledTime(
              activity
            );

            const activityId =

              activity.id ||

              activity.activityId;

            // =========================
            // INVALID ACTIVITY FIX
            // =========================

            if (

              !activityId ||

              !activityMap.has(
                activityId
              )
            ) {

              const replacement =
                getUnusedActivity();

              if (replacement) {

                activity = {

                  ...replacement,

                  scheduledTime:
                    activity.scheduledTime
                };
              }
            }

            const updatedActivityId =

              activity.id ||

              activity.activityId;

            // =========================
            // DUPLICATE FIX
            // =========================

            if (

              updatedActivityId &&

              usedIds.has(
                updatedActivityId
              )
            ) {

              const replacement =
                getUnusedActivity();

              if (replacement) {

                activity = {

                  ...replacement,

                  scheduledTime:
                    activity.scheduledTime
                };
              }
            }

            const finalActivityId =

              activity.id ||

              activity.activityId;

            if (finalActivityId) {

              usedIds.add(
                finalActivityId
              );
            }

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