import { getRestaurants } from "../services/food.service.js";
import APIResponse from "../utils/APIResponse.js"
import asyncHandler from "../utils/asyncHandler.js";

export const getFoodOptions = asyncHandler(async (req, res) => {
    const { destination, limit } = req.query;

    if (!destination) {
      return res.status(400).json({ error: "Missing 'destination' query parameter" });
    }

    const data = await getRestaurants(destination, Number(limit));
    res.status(200).json(new APIResponse(200, data, "Restaurants fetched successfully"));
});