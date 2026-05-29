import axios from "axios";
import APIError from "../utils/APIError.js";
import { resolveDestinationGeo } from "../utils/geocode.js";
import { getPlacesPhotoProxyUrl } from "../utils/googlePlacesPhoto.js";


// =========================
// Interest Query Mapping
// =========================

const activityQueries = {

  Beaches:
    "best beaches",

  CitySightseeing:
    "top tourist attractions",

  OutdoorAdventures:
    "best outdoor activities",

  Nightlife:
    "best nightclubs",

  Shopping:
    "best shopping malls",

  SpaWellness:
    "best spas and wellness centers",
};


// =========================
// Estimated Visit Duration
// =========================

const estimateVisitDuration = (
  types = []
) => {

  if (
    types.includes("museum")
  ) {

    return "2-4 hours";
  }

  if (
    types.includes("art_gallery")
  ) {

    return "1-3 hours";
  }

  if (
    types.includes("amusement_park")
  ) {

    return "5-8 hours";
  }

  if (
    types.includes("park")
  ) {

    return "1-2 hours";
  }

  if (
    types.includes("zoo")
  ) {

    return "3-5 hours";
  }

  if (
    types.includes("shopping_mall")
  ) {

    return "2-5 hours";
  }

  if (
    types.includes("spa")
  ) {

    return "1-4 hours";
  }

  if (
    types.includes("night_club")
  ) {

    return "2-6 hours";
  }

  if (
    types.includes("church")
    ||
    types.includes("mosque")
    ||
    types.includes("hindu_temple")
  ) {

    return "30 mins - 1.5 hours";
  }

  if (
    types.includes("tourist_attraction")
  ) {

    return "1-2 hours";
  }

  return "1-2 hours";
};


// =========================
// Tourist Attractions Service
// =========================

export const getTouristAttractions = async (

  destination,

  activityType =
    "CitySightseeing",

  limit = 10,

  latitude = null,

  longitude = null
) => {

  try {

    const geo =
      await resolveDestinationGeo(
        destination,
        latitude,
        longitude
      );

    const { latitude: lat, longitude: lng } = geo;

    // =========================
    // Activity Query
    // =========================

    const activityQuery =
      activityQueries[
        activityType
      ]
      ||
      "top tourist attractions";

    // =========================
    // Google Places Text Search
    // =========================

    const placesUrl =
      "https://maps.googleapis.com/maps/api/place/textsearch/json";

    const placesRes =
      await axios.get(
        placesUrl,
        {
          params: {

            query:
              `${activityQuery} in ${destination}`,

            location:
              `${lat},${lng}`,

            radius:
              15000,

            key:
              process.env.GOOGLE_PLACES_API_KEY,
          },
        }
      );

    let results =
      placesRes.data.results || [];

    if (!results.length) {

      throw new APIError(
        404,
        `No places found for ${activityType} in ${destination}`
      );
    }

    // =========================
    // Filter + Rank
    // =========================

    results = results

      .filter((place) =>
        place.rating
        &&
        place.user_ratings_total > 50
      )

      .sort((a, b) => {

        if (b.rating === a.rating) {

          return (
            b.user_ratings_total
            -
            a.user_ratings_total
          );
        }

        return (
          b.rating
          -
          a.rating
        );
      })

      .slice(0, limit);

    // =========================
    // Normalize Results
    // =========================

    const attractions =
      results.map((place) => ({

        name:
          place.name,

        address:
          place.formatted_address,

        rating:
          place.rating ?? "N/A",

        totalReviews:
          place.user_ratings_total ?? 0,

        types:
          place.types || [],

        estimatedVisitDuration:
          estimateVisitDuration(
            place.types || []
          ),

        location: {

          latitude:
            place.geometry?.location?.lat,

          longitude:
            place.geometry?.location?.lng,
        },

        priceLevel:
          place.price_level ?? "N/A",

        openNow:
          place.opening_hours
            ?.open_now ?? null,

        photoReference:
          place.photos?.[0]
            ?.photo_reference || null,

        photoUrl: getPlacesPhotoProxyUrl(
          place.photos?.[0]?.photo_reference || null
        ),

        googleMapsUrl:
          `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      }));

    return {

      destination,

      activityType,

      totalResults:
        attractions.length,

      attractions,
    };

  } catch (error) {

    console.error(
      "Attractions Service Error:",
      error.response?.data
      || error.message
    );

    throw new APIError(
      500,
      "Failed to fetch tourist attractions"
    );
  }
};