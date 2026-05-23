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

    switch (
      intent.action
    ) {

      case "add_nightlife":

        itinerary =
          addNightlife({

            itinerary,

            activities:
              state.activities
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
              state.activities
        });

        break;

      case "add_food":

        itinerary =
          addFood({

            itinerary,

            activities:
              state.activities
        });

        break;

      case "remove_activity":

        itinerary =
          removeActivity({

            itinerary,

            targetActivityId:
              intent.entities.targetActivityId
        });

        break;
    }

    return {

      ...state,

      itinerary
    };
};