import {
  getHotelsFromBooking
}
from "../services/accommodation.service.js";

import APIResponse
from "../utils/APIResponse.js";

import asyncHandler
from "../utils/asyncHandler.js";

import APIError
from "../utils/APIError.js";


// =========================
// Accommodation Controller
// =========================

export const getAccommodation =
  asyncHandler(async (req, res) => {

    const {

      city,

      checkin_date,

      checkout_date,

      minBudget,

      maxBudget,

      adults,

      limit,

    } = req.query;

    if (
      !city
      ||
      !checkin_date
      ||
      !checkout_date
    ) {

      throw new APIError(
        400,
        "Missing required parameters"
      );
    }

    const data =
      await getHotelsFromBooking(

        city,

        checkin_date,

        checkout_date,

        Number(minBudget),

        Number(maxBudget),

        Number(adults),

        Number(limit)
      );

    res.status(200).json(

      new APIResponse(

        200,

        data,

        "Hotels fetched successfully"
      )
    );
});