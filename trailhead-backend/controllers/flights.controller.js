import { getFlights } from "../services/flights.service.js";

import APIError from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getFlightsData = asyncHandler(async (req, res) => {

    const {source, destination, start_date, end_date} = req.query;

    if (!source || !destination || !start_date || !end_date)
        throw new APIError(400, "Missing required query parameters");

    const data = await getFlights(source, destination, start_date,end_date);

    res.status(200).json(
        new APIResponse(200, data, "Flights fetched successfully")
    );
});