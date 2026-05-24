import asyncHandler
from "../utils/asyncHandler.js";

import APIError
from "../utils/APIError.js";

import APIResponse
from "../utils/APIResponse.js";

import {
  generateTripPlan
}
from "../services/planner.service.js";


// =========================
// Planner Controller
// =========================

export const generatePlanner =
  asyncHandler(async (req, res) => {

    const {

      source,

      destination,

      start_date,

      trip_days,

      adults,

      interests,

      budget,
    } = req.body;

    if (
      !source
      ||
      !destination
      ||
      !start_date
      ||
      !trip_days
    ) {

      throw new APIError(
        400,
        "Missing required planner inputs"
      );
    }

    const parsedInterests =
      interests || [];

    const parsedBudget =
      budget || {};

    const data =
      await generateTripPlan(

        source,

        destination,

        start_date,

        Number(trip_days),

        Number(adults),

        parsedInterests,

        parsedBudget
      );

    res.status(200).json(

      new APIResponse(

        200,

        data,

        "Trip plan generated successfully"
      )
    );
});