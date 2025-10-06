import axios from "axios";
import polyline from "@mapbox/polyline";

export const getRouteFromORS = async (from, to) => {
  try {
    const apiKey = process.env.ORS_API_KEY;
    const geocodeUrl = "https://api.openrouteservice.org/geocode/search";

    const [fromRes, toRes] = await Promise.all([
      axios.get(geocodeUrl, { params: { api_key: apiKey, text: from } }),
      axios.get(geocodeUrl, { params: { api_key: apiKey, text: to } }),
    ]);

    const fromCoords = fromRes.data.features[0].geometry.coordinates;
    const toCoords = toRes.data.features[0].geometry.coordinates;

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

    let summary, geometry;
    if (routeRes.data.routes?.length > 0) {
      summary = routeRes.data.routes[0].summary;
      geometry = routeRes.data.routes[0].geometry;
    }

    const decodedCoords = polyline.decode(geometry);

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
