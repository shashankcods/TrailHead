import asyncHandler from "../utils/asyncHandler.js";
import APIResponse from "../utils/APIResponse.js";

import {
  getTouristAttractions
}
from "../services/attractions.service.js";

export const getAttractions =
  asyncHandler(async (req, res) => {

    const {

      destination,

      activityType,

      limit,

    } = req.query;

    const data =
      await getTouristAttractions(

        destination,

        activityType,

        Number(limit)
      );

    return res.status(200).json(

      new APIResponse(
        200,
        data,
        "Attractions data fetched successfully"
      )
    );
});