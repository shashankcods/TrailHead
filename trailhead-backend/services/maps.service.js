import axios from "axios";
import polyline from "@mapbox/polyline";
import APIError from "../utils/APIError.js";

export const getRouteFromORS = async (from, to) => {

  try {

    const apiKey = process.env.ORS_API_KEY;

    const geocodeUrl = "https://api.openrouteservice.org/geocode/search";

    // geocode both locations
    const [fromRes, toRes] = await Promise.all([
      axios.get(geocodeUrl,
          {
            params: {
              api_key: apiKey,
              text: from,
            },
          }
        ),

      axios.get(
        geocodeUrl,
          {
            params: {
              api_key: apiKey,
              text: to,
            },
          }
        ),
      ]);

    if (!fromRes.data.features?.length || !toRes.data.features?.length) {
      throw new APIError(404, "Location not found");
    }

    // extract coordinates
    const fromCoords = fromRes.data.features[0].geometry.coordinates;
    const toCoords = toRes.data.features[0].geometry.coordinates;

    // ORS route endpoints
    const drivingUrl = "https://api.openrouteservice.org/v2/directions/driving-car";

    const walkingUrl = "https://api.openrouteservice.org/v2/directions/foot-walking";

    // Fetch Driving + Walking
    const [drivingRes, walkingRes] = await Promise.all([

      axios.post(
        drivingUrl,
        {
          coordinates: [
            fromCoords,
            toCoords,
          ],
        },
        {
          headers: {
            Authorization: apiKey,
            "Content-Type":
              "application/json",
          },
        }
      ),
      axios.post(
        walkingUrl,
        {
          coordinates: [
            fromCoords,
            toCoords,
          ],
        },
        {
          headers: {
            Authorization: apiKey,
            "Content-Type":
              "application/json",
          },
        }
      ),
    ]);

    // extract route data
    const drivingRoute = drivingRes.data.routes?.[0];

    const walkingRoute = walkingRes.data.routes?.[0];

    if (!drivingRoute || !walkingRoute) {
      throw new APIError(404, "No routes found");
    }

    const drivingSummary = drivingRoute.summary;

    const walkingSummary = walkingRoute.summary;

    // decode geometry
    // const drivingGeometry = polyline.decode(drivingRoute.geometry);
    // const walkingGeometry = polyline.decode(walkingRoute.geometry);

    return {
      from,
      to,
      coordinates: {
        from: {
          longitude:
            fromCoords[0],
          latitude:
            fromCoords[1],
        },
        to: {
          longitude:
            toCoords[0],
          latitude:
            toCoords[1],
        },
      },

      driving: {
        distance_km:
          (
            drivingSummary.distance
            / 1000
          ).toFixed(1),
        duration_hr:
          (
            drivingSummary.duration
            / 3600
          ).toFixed(1),
      },

      walking: {
        distance_km:
          (
            walkingSummary.distance
            / 1000
          ).toFixed(1),

        duration_hr:
          (
            walkingSummary.duration
            / 3600
          ).toFixed(1),
      },

      // drivingGeometry,
      // walkingGeometry,
    };

  } catch (err) {
    console.error("ORS Route Error:", err.response?.data || err.message);
    throw new APIError(500, "Failed to fetch route data from OpenRouteService");
  }
};