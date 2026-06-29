import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/APIError.js";
import ApiResponse from "../utils/APIResponse.js";

import { generateCalendar } from "../services/calendar.service.js";


export const createCalendar = asyncHandler(async (req, res) => {
  const { destination, startDate, endDate } = req.body;

  if (!startDate || !endDate)
    throw new ApiError(400, "startDate and endDate are required");

  const result = await generateCalendar(
    destination,
    startDate,
    endDate
  );

  res.status(200)
  .json(new ApiResponse(200, result, "Calendar generated successfully"));
});