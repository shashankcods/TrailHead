import axios from "axios";
import APIError from "../utils/APIError.js";

export const getPlacePhoto = async (req, res) => {
  const reference = req.query.reference;

  if (!reference || typeof reference !== "string") {
    throw new APIError(400, "Missing photo reference");
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new APIError(500, "Google Places API key is not configured");
  }

  const photoUrl =
    `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=800&photo_reference=${encodeURIComponent(reference)}` +
    `&key=${apiKey}`;

  try {
    const response = await axios.get(photoUrl, {
      responseType: "stream",
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error("Place photo proxy error:", error.message);
    throw new APIError(502, "Failed to fetch place photo");
  }
};
