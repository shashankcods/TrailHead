import axios from "axios"; // Used for making API req to ORS
import polyline from "@mapbox/polyline";

export const getRouteFromORS = async (from, to) => {
  try {
    const apiKey = process.env.ORS_API_KEY;  // ORS API Key stored in .env for security
    const geocodeUrl = "https://api.openrouteservice.org/geocode/search"; // ORS endpoint for converting place names into coordinates

    // Make parallel requests to get coordinates for both 'from' and 'to' locations
    const [fromRes, toRes] = await Promise.all([
      axios.get(geocodeUrl, { params: { api_key: apiKey, text: from } }),
      axios.get(geocodeUrl, { params: { api_key: apiKey, text: to } }),
    ]);

    // Extract coordinates
    const fromCoords = fromRes.data.features[0].geometry.coordinates;
    const toCoords = toRes.data.features[0].geometry.coordinates;

    // Make POST request with both coordinates to get route summary and geometry
    const routeUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
    const routeRes = await axios.post(
      routeUrl,
      { coordinates: [fromCoords, toCoords] },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract route summary and encoded geometry from response
    let summary, geometry;
    if (routeRes.data.routes?.length > 0) {
      summary = routeRes.data.routes[0].summary;
      geometry = routeRes.data.routes[0].geometry;
    }

    // const decodedCoords = polyline.decode(geometry);

    // Return clean route summary object
    return {
      from,
      to,
      distance_km: (summary.distance / 1000).toFixed(1),
      duration_hr: (summary.duration / 3600).toFixed(1),
      // geometry: decodedCoords, // this gives the full route path, every pt on the road from one place to another
    };
  } catch (err) {
    console.error("Error:", err.message);
    throw new Error("Failed to fetch route data from OpenRouteService");
  }
};
