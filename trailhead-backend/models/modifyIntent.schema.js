import { z } from "zod";

export const ModifyIntentSchema =
  z.object({

    action:
      z.enum([

        "replace_activity",

        "add_nightlife",

        "relax_day",

        "reduce_budget",

        "add_food",

        "remove_activity",

        "unknown"
      ]),

    entities:
      z.object({

        day:
          z.number()
            .nullable()
            .optional(),

        targetActivityId:
          z.string()
            .nullable()
            .optional(),

        replacementStyle:
          z.string()
            .nullable()
            .optional(),

        budgetPreference:
          z.string()
            .nullable()
            .optional()
      }),

    confidence:
      z.number()
        .min(0)
        .max(1),

    reasoning:
      z.string()
  });