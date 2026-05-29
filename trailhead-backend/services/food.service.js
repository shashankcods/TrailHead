import axios from "axios";
import APIError from "../utils/APIError.js";
import { resolveDestinationGeo } from "../utils/geocode.js";
import { getPlacesPhotoProxyUrl } from "../utils/googlePlacesPhoto.js";


// =========================
// Restaurants Service
// =========================

export const getRestaurants = async (

  destination,

  limit = 10,

  latitude = null,

  longitude = null,

  country = null
) => {

  try {

    const geo =
      await resolveDestinationGeo(
        destination,
        latitude,
        longitude,
        country
      );

    const {
      latitude: lat,
      longitude: lng,
      country: resolvedCountry,
    } = geo;

    // =========================
    // Google Places Text Search
    // =========================

    const searchQueries = [

      `best restaurants in ${destination}`,

      `top rated restaurants in ${destination}`,
    ];

    let allResults = [];

    for (const query of searchQueries) {

      const textSearchUrl =
        "https://maps.googleapis.com/maps/api/place/textsearch/json";

      const res =
        await axios.get(
          textSearchUrl,
          {
            params: {
              query,

              key:
                process.env.GOOGLE_PLACES_API_KEY,
            },
          }
        );

      allResults.push(
        ...(res.data.results || [])
      );
    }

    // =========================
    // Remove Duplicates
    // =========================

    const uniqueMap =
      new Map();

    allResults.forEach((r) => {

      if (
        r.place_id
        &&
        !uniqueMap.has(r.place_id)
      ) {

        uniqueMap.set(
          r.place_id,
          r
        );
      }
    });

    let results =
      [...uniqueMap.values()];

    // =========================
    // Filter Restaurants Only
    // =========================

    results = results.filter((r) => {

      const types =
        r.types || [];

      return (

        types.includes("restaurant")
        &&

        !types.includes("lodging")
      );
    });

    if (!results.length) {

      throw new APIError(
        404,
        `No restaurants found near ${destination}`
      );
    }

    // =========================
    // Weighted Ranking
    // =========================

    results = results

      .filter((r) => r.rating)

      .map((r) => ({

        ...r,

        score:
          r.rating *
          Math.log10(
            (r.user_ratings_total || 1)
          ),
      }))

      .sort(
        (a, b) =>
          b.score - a.score
      )

      .slice(0, limit);

    // =========================
    // Price Mapping
    // =========================

    const priceMap = {

      0: "$",

      1: "$",

      2: "$$",

      3: "$$$",

      4: "$$$$",
    };

    // =========================
    // Fetch Place Details
    // =========================

    const restaurants =
      await Promise.all(

        results.map(async (r) => {

          try {

            const detailsUrl =
              "https://maps.googleapis.com/maps/api/place/details/json";

            const detailsRes =
              await axios.get(
                detailsUrl,
                {
                  params: {

                    place_id:
                      r.place_id,

                    fields: [
                      "opening_hours",
                      "formatted_phone_number",
                      "website",
                      "editorial_summary",
                      "price_level",
                    ].join(","),

                    key:
                      process.env.GOOGLE_PLACES_API_KEY,
                  },
                }
              );

            const details =
              detailsRes.data.result || {};

            return {

              placeId:
                r.place_id,

              name:
                r.name,

              address:
                r.formatted_address
                || r.vicinity,

              rating:
                r.rating ?? "N/A",

              totalReviews:
                r.user_ratings_total
                ?? 0,

              score:
                Number(
                  r.score.toFixed(2)
                ),

              priceLevel:
                priceMap[
                  details.price_level
                ] || "$$",

              cuisine:
                r.types?.filter(
                  (t) =>
                    ![
                      "restaurant",
                      "food",
                      "point_of_interest",
                      "establishment",
                    ].includes(t)
                ) || [],

              coordinates: {

                latitude:
                  r.geometry?.location?.lat,

                longitude:
                  r.geometry?.location?.lng,
              },

              openingHours:
                details.opening_hours
                  ?.weekday_text || [],

              phoneNumber:
                details.formatted_phone_number
                || null,

              website:
                details.website || null,

              description:
                details.editorial_summary
                  ?.overview || null,

              businessStatus:
                r.business_status
                || "Unknown",

              photoReference:
                r.photos?.[0]
                  ?.photo_reference || null,

              photoUrl: getPlacesPhotoProxyUrl(
                r.photos?.[0]?.photo_reference || null
              ),

              googleMapsUrl:
                `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
            };

          } catch {

            return null;
          }
        })
      );

    return {

      destination,

      country:
        resolvedCountry || "Unknown",

      coordinates: {

        latitude: lat,

        longitude: lng,
      },

      requestedResults:
        limit,

      totalResults:
        restaurants.filter(Boolean)
          .length,

      restaurants:
        restaurants.filter(Boolean),
    };

  } catch (error) {

    console.error(
      "Restaurant Service Error:",
      error.message
    );

    throw new APIError(

      error.statusCode || 500,

      error.message
      ||
      "Failed to fetch restaurant data"
    );
  }
};