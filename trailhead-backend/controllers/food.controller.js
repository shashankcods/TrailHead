import { getRestaurants } from "../services/food.service.js";
import APIError from "../utils/ApiError.js";
import APIResponse from "../../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";

export const getFoodOptions = asyncHandler(async (req, res) => {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({ error: "Missing 'destination' query parameter" });
    }

    const data = await getRestaurants(destination);
    res.status(200).json(new APIResponse(200, data, "Restaurants fetched successfully"));
});