import axios from "axios";
import APIError from "../utils/APIError.js";

// Fetches top-rated restaurants for a given destination
// Uses OpenRouteService for geocoding, then Google Places API for restaurant data
export const getRestaurants = async (destination) => {
  try {
    // Convert destination name to coordinates using ORS
    const geoUrl = "https://api.openrouteservice.org/geocode/search";
    const geoRes = await axios.get(geoUrl, {
      params: {
        api_key: process.env.ORS_API_KEY, // same key used in Weather Agent
        text: destination,
      },
    });

    const location = geoRes.data.features?.[0];
    if (!location) throw new APIError(404, "Location not found");

    const [longitude, latitude] = location.geometry.coordinates;
    const label = location.properties.label || destination;
    const country = label.split(",").pop().trim();

    console.log(`Geocoded via ORS: ${destination} → ${latitude}, ${longitude}`);

    // Query Google Places API for restaurants nearby
    const placesUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const params = {
      location: `${latitude},${longitude}`,
      radius: 5000, // 5km radius
      type: "restaurant",
      key: process.env.GOOGLE_PLACES_API_KEY,
    };

    const res = await axios.get(placesUrl, { params });
    let results = res.data.results || [];

    if (results.length === 0) {
      throw new APIError(404, `No restaurants found near ${destination}.`)
    }

    // Sort restaurants by rating & total reviews
    results = results
      .filter((r) => r.rating)
      .sort((a, b) => {
        if (b.rating === a.rating) {
          return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
        }
        return b.rating - a.rating;
      })
      .slice(0, 10);

    // Format restaurant data neatly
    const restaurants = results.map((r) => ({
      name: r.name,
      address: r.vicinity,
      rating: r.rating ?? "N/A",
      totalReviews: r.user_ratings_total ?? 0,
      priceLevel: r.price_level ?? "N/A",
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
    }));

    // Return structured data for frontend
    return {
      destination,
      country: country || "Unknown",
      topCount: restaurants.length,
      restaurants,
    };
  } catch (error) {
    throw new APIError(500, "Failed to fetch restaurant data");
  }
};
