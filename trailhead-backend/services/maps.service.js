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

export const getCityAutocomplete = async (query) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new APIError(500, "Google Places API key not configured");
    }

    // Google Places Autocomplete API endpoint
    const url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    
    const response = await axios.get(url, {
      params: {
        input: query,
        key: apiKey,
        types: "(cities)", // Limit to cities
        language: "en"
      }
    });

    if (!response.data.predictions) {
      return [];
    }

    // First pass: transform predictions
    const processedSuggestions = response.data.predictions.map(prediction => {
      const terms = prediction.terms;
      const city = terms[0]?.value;
      const country = terms[terms.length - 1]?.value;
      const normalizedCity = city.toLowerCase().trim();
      
      return {
        label: prediction.description,
        city: city,
        normalizedCity: normalizedCity,
        country: country,
        placeId: prediction.place_id,
        types: prediction.types
      };
    });

    // Filter out weak place types
    const weakTypes = [
      "village", "hamlet", "suburb", "neighbourhood", "neighborhood",
      "county", "district", "municipality", "administrative_area_level_3",
      "administrative_area_level_4"
    ];

    let filteredSuggestions = processedSuggestions.filter(pred => {
      const hasWeakType = pred.types.some(type => weakTypes.includes(type));
      const hasWeakKeyword = ["town of", "village of", "cdp"].some(keyword => 
        pred.label.toLowerCase().includes(keyword)
      );
      return !hasWeakType && !hasWeakKeyword;
    });

    // Check for major city and filter duplicates in other countries
    const majorCities = new Map();
    filteredSuggestions.forEach(pred => {
      if (!majorCities.has(pred.normalizedCity)) {
        majorCities.set(pred.normalizedCity, pred.country);
      }
    });

    // Keep only first occurrence of each city name (prioritizing first match)
    const uniqueCities = new Set();
    filteredSuggestions = filteredSuggestions.filter(pred => {
      const key = `${pred.normalizedCity}-${pred.country}`;
      if (uniqueCities.has(key)) return false;
      uniqueCities.add(key);
      return true;
    });

    // Now, if there are multiple same-city names, keep only the first one
    const cityNameSet = new Set();
    filteredSuggestions = filteredSuggestions.filter(pred => {
      if (cityNameSet.has(pred.normalizedCity)) {
        return false;
      }
      cityNameSet.add(pred.normalizedCity);
      return true;
    });

    // Finalize the suggestion objects
    const finalSuggestions = filteredSuggestions.map(pred => ({
      label: pred.label,
      city: pred.city,
      country: pred.country,
      placeId: pred.placeId
    }));

    // Limit to best 5
    return finalSuggestions.slice(0, 5);

  } catch (err) {
    console.error("Google Places Autocomplete Error:", err.response?.data || err.message);
    throw new APIError(500, "Failed to fetch autocomplete suggestions");
  }
};