import asyncHandler
from "../utils/asyncHandler.js";

import APIError
from "../utils/ApiError.js";

import APIResponse
from "../utils/ApiResponse.js";

import {
  getEvents
}
from "../services/events.service.js";


// =========================
// Events Controller
// =========================

export const fetchEvents =
  asyncHandler(async (req, res) => {

    const {

      location,

      startDate,

      endDate,

      limit,

    } = req.query;

    if (
      !location
      ||
      !startDate
      ||
      !endDate
    ) {

      throw new APIError(
        400,
        "Missing required parameters"
      );
    }

    const data =
      await getEvents(

        location,

        startDate,

        endDate,

        Number(limit)
      );

    res.status(200).json(

      new APIResponse(

        200,

        data,

        "Events fetched successfully"
      )
    );
});