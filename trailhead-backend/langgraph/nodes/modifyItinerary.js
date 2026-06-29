import {
  addNightlife
} from "../modifiers/addNightLife.js";

import {
  relaxDay
} from "../modifiers/relaxDay.js";

import {
  replaceActivity
} from "../modifiers/replaceActivity.js";

import {
  reduceBudget
} from "../modifiers/reduceBudget.js";

import {
  addFood
} from "../modifiers/addFood.js";

import {
  removeActivity
} from "../modifiers/removeActivity.js";

export const modifyItineraryNode =
  async (state) => {

    let itinerary =
      structuredClone(
        state.itinerary
      );

    const intent =
      state.intent;

    if (!intent?.action || intent.action === "unknown" || intent.action === "summarize") {
      if (intent?.action !== "summarize") {
        console.warn("[modifyItineraryNode] No valid intent — returning itinerary unchanged");
      }
      return { ...state, itinerary };
    }

    switch (
      intent.action
    ) {

      case "add_nightlife":

        itinerary =
          addNightlife({

            itinerary,

            activities:
              state.activities,

            day:
              intent.entities?.day,

            afterActivityId:
              intent.entities?.targetActivityId
        });

        break;

      case "relax_day":

        itinerary =
          relaxDay({

            itinerary,

            day:
              intent.entities.day
        });

        break;

      case "replace_activity":

        itinerary =
          replaceActivity({

            itinerary,

            activities:
              state.activities,

            targetActivityId:
              intent.entities.targetActivityId,

            replacementStyle:
              intent.entities.replacementStyle
        });

        break;

      case "reduce_budget":

        itinerary =
          reduceBudget({

            itinerary,

            activities:
              state.activities,

            budgetPreference:
              intent.entities?.budgetPreference
        });

        break;

      case "add_food":

        itinerary =
          addFood({

            itinerary,

            activities:
              state.activities,

            day:
              intent.entities?.day
        });

        break;

      case "remove_activity":

        itinerary =
          removeActivity({

            itinerary,

            targetActivityId:
              intent.entities.targetActivityId,

            targetActivityTitle:
              intent.entities.targetActivityTitle
        });

        break;
    }

    return {

      ...state,

      itinerary
    };
};