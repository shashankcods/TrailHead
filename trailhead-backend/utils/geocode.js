import axios from "axios";
import APIError from "./APIError.js";

const ORS_GEOCODE_URL =
  "https://api.openrouteservice.org/geocode/search";

const geocodeCache = new Map();

/**
 * Normalize a destination string (first segment before comma).
 */
export const cleanDestination = (destination) => {
  if (typeof destination !== "string") {
    return destination;
  }

  return destination.split(",")[0].trim();
};

const cacheKey = (location) =>
  cleanDestination(location).toLowerCase();

/**
 * Geocode a location via OpenRouteService (cached).
 * @returns {{ city: string, country: string, lat: number, lon: number }}
 */
export const geocodeLocation = async (location) => {
  const key = cacheKey(location);

  if (geocodeCache.has(key)) {
    console.log(
      `📍 Geocode cache HIT: "${key}" (size=${geocodeCache.size})`
    );
    return geocodeCache.get(key);
  }

  try {
    const response = await axios.get(ORS_GEOCODE_URL, {
      params: {
        api_key: process.env.ORS_API_KEY,
        text: cleanDestination(location),
        size: 1,
      },
    });

    const feature = response.data.features?.[0];

    if (!feature) {
      throw new APIError(404, `Could not geocode ${location}`);
    }

    const [lon, lat] = feature.geometry.coordinates;

    const result = {
      city:
        feature.properties.locality ||
        feature.properties.label ||
        cleanDestination(location),
      country:
        feature.properties.country ||
        feature.properties.label?.split(",").pop()?.trim() ||
        "Unknown",
      lat,
      lon,
    };

    geocodeCache.set(key, result);

    console.log(
      `📍 Geocoded ${location} → ${lat}, ${lon} (cached as "${key}", size=${geocodeCache.size})`
    );

    return result;
  } catch (error) {
    console.error("Geocoding Error:", error.message);

    throw new APIError(
      error.statusCode || 500,
      `Failed to geocode ${location}`
    );
  }
};

/**
 * Geocode a destination via OpenRouteService (cached).
 * @returns {{ destination: string, label: string, latitude: number, longitude: number, country: string }}
 */
export const geocodeDestination = async (destination) => {
  const key = cacheKey(destination);

  if (geocodeCache.has(key)) {
    console.log(
      `📍 Geocode cache HIT: "${key}" (size=${geocodeCache.size})`
    );
    const cached = geocodeCache.get(key);
    return {
      destination: cleanDestination(destination),
      label: destination,
      latitude: cached.lat,
      longitude: cached.lon,
      country: cached.country,
    };
  }

  const { city, country, lat, lon } =
    await geocodeLocation(destination);

  return {
    destination: cleanDestination(destination),
    label: city,
    latitude: lat,
    longitude: lon,
    country,
  };
};

/**
 * Use pre-resolved coordinates or geocode when latitude/longitude are omitted.
 */
export const resolveDestinationGeo = async (
  destination,
  latitude,
  longitude,
  country
) => {
  if (latitude != null && longitude != null) {
    return {
      destination: cleanDestination(destination),
      label: destination,
      latitude,
      longitude,
      country: country ?? "Unknown",
    };
  }

  return geocodeDestination(destination);
};
