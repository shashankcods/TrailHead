import crypto from "crypto";
import { getPlacesPhotoProxyUrl } from "./googlePlacesPhoto.js";

// =========================
// Helpers
// =========================

const extractPlaceId = (
  mapsUrl = ""
) => {

  const match =
    mapsUrl.match(
      /place_id:([^&]+)/i
    );

  return match
    ? match[1]
    : null;
};

const extractTicketmasterId = (
  url = ""
) => {

  const match =
    url.match(
      /tickets\/(\d+)/i
    );

  return match
    ? match[1]
    : null;
};

const safeNumber = (
  value,
  fallback = null
) => {

  const num = Number(value);

  return isNaN(num)
    ? fallback
    : num;
};

const normalizeTags = (
  category,
  type
) => {

  const tags = [];

  if (category) {
    tags.push(category);
  }

  if (type) {
    tags.push(type);
  }

  return tags;
};


// =========================
// Normalize Attractions
// =========================

const normalizeAttractions = (
  attractionsByInterest = {}
) => {

  const normalized = [];

  for (const interest in attractionsByInterest) {

    const interestData =
      attractionsByInterest[
        interest
      ];

    const attractions =
      interestData?.attractions
      || [];

    if (
      !Array.isArray(attractions)
    ) {
      continue;
    }

    for (const attraction of attractions) {

      normalized.push({

        id:
          `attr_${crypto.randomUUID()}`,

        sourceId: extractPlaceId(attraction.googleMapsUrl),

        sourceType:
          "attraction",

        title:
          attraction.name
          || "Unknown Attraction",

        category:
          interest,

        tags:
          attraction.types || [],

        description:
          `${interest} attraction in ${interestData.destination}`,

        image:
          attraction.photoUrl
          || getPlacesPhotoProxyUrl(attraction.photoReference)
          || "",

        photoUrl:
          attraction.photoUrl
          || getPlacesPhotoProxyUrl(attraction.photoReference),

        photoReference:
          attraction.photoReference || null,

        googleMapsUrl:
          attraction.googleMapsUrl || "",

        rating:
          safeNumber(
            attraction.rating
          ),

        estimatedCost: {

          min: 0,

          max:
            attraction.priceLevel === "$$$"
              ? 100
              : attraction.priceLevel === "$$"
              ? 50
              : 20,

          currency:
            "USD"
        },

        durationMinutes:
          attraction.estimatedVisitDuration
            ?.includes("2-6")
            ? 240
            : attraction.estimatedVisitDuration
                ?.includes("1-2")
            ? 120
            : 90,

        recommendedVisitTime:

          interest === "Nightlife"
            ? "Night"

          : interest === "City Sightseeing"
            ? "Morning"

          : "Afternoon",

        openingHours:
          null,

        coordinates: {

          lat:
            safeNumber(
              attraction.location?.latitude
            ),

          lon:
            safeNumber(
              attraction.location?.longitude
            )
        },

        address:
          attraction.address
          || "",

        links: {

          website: "",

          maps:
            attraction.googleMapsUrl
            || ""
        },

        popularityScore:
          (
            safeNumber(
              attraction.rating,
              0
            )

            *

            Math.log10(
              (
                attraction.totalReviews
                || 0
              ) + 1
            )
          ),

        metadata: {

          totalReviews:
            attraction.totalReviews
            || 0,

          openNow:
            attraction.openNow,

          activityType:
            interestData.activityType
            || ""
        }
      });
    }
  }

  return normalized;
};


// =========================
// Normalize Restaurants
// =========================

const normalizeRestaurants = (
  restaurantsData = {}
) => {

  const restaurants = restaurantsData.restaurants || [];
  if (!Array.isArray(restaurants)) { return []; }

  return restaurants.map(
    (restaurant) => ({

      id:
        `rest_${crypto.randomUUID()}`,

      sourceId: restaurant.placeId || extractPlaceId(restaurant.googleMapsUrl),

      sourceType:
        "restaurant",

      title:
        restaurant.name
        || "Unknown Restaurant",

      category:
        restaurant.cuisine?.[0]
        || "Restaurant",

      tags:
        normalizeTags(
          restaurant.cuisine?.[0],
          "food"
        ),

      description:
        restaurant.description
        || "",

      image:
        restaurant.photoReference
        || "",

      rating:
        safeNumber(
          restaurant.rating
        ),

      estimatedCost: {

        min: 15,

        max:
          restaurant.priceLevel === "$$$"
            ? 80
            : restaurant.priceLevel === "$$"
            ? 40
            : 20,

        currency:
          "USD"
      },

      durationMinutes:
        90,

      recommendedVisitTime:
        "Lunch",

      openingHours:
        restaurant.openingHours
        || null,

      coordinates: {

        lat:
          safeNumber(
            restaurant.coordinates?.latitude
          ),

        lon:
          safeNumber(
            restaurant.coordinates?.longitude
          )
      },

      address:
        restaurant.address
        || "",

      links: {

        website:
          restaurant.website
          || "",

        maps:
          restaurant.googleMapsUrl
          || ""
      },

      popularityScore:
        (
          safeNumber(
            restaurant.rating,
            0
          )

          *

          Math.log10(
            (
              restaurant.totalReviews
              || 0
            ) + 1
          )
        ),

      metadata: {

        totalReviews:
          restaurant.totalReviews
          || 0,

        businessStatus:
          restaurant.businessStatus
          || "UNKNOWN"
      }
    })
  );
};


// =========================
// Normalize Events
// =========================

const normalizeEvents = (
  eventsData = {}
) => {

  const events =
    eventsData.events || [];

  if (!Array.isArray(events)) {
    return [];
  }

  return events.map(
    (event) => ({

      id:
        `event_${crypto.randomUUID()}`,

      sourceId: extractTicketmasterId(event.ticketUrl),

      sourceType:
        "event",

      title:
        event.title
        || "Unknown Event",

      category:
        event.category
        || "Event",

      tags:
        normalizeTags(
          event.category,
          "event"
        ),

      description:
        `${event.category} event in ${event.city}`,

      image:
        event.image
        || "",

      imageUrl:
        event.image || "",

      website:
        event.ticketUrl || "",

      ticketUrl:
        event.ticketUrl || "",

      rating:
        null,

      estimatedCost: {

        min: 20,

        max:
          event.category === "Music"
            ? 120
            : 60,

        currency:
          "USD"
      },

      durationMinutes:
        180,

      recommendedVisitTime:
        "Evening",

      openingHours:
        null,

      coordinates: {

        lat: null,

        lon: null
      },

      address:
        event.venue
        || "",

      links: {

        website:
          event.ticketUrl
          || "",

        maps: ""
      },

      metadata: {

        source:
          event.source
          || "",

        status:
          event.status
          || "",

        start:
          event.start
          || "",

        end:
          event.end
          || "",

        city:
          event.city
          || "",

        country:
          event.country
          || ""
      }
    })
  );
};


// =========================
// Main Normalizer
// =========================

export const normalizeActivities = ({
  attractionsByInterest = {},
  restaurants = [],
  events = []
}) => {

  return [

    ...normalizeAttractions(
      attractionsByInterest
    ),

    ...normalizeRestaurants(
      restaurants
    ),

    ...normalizeEvents(
      events
    )
  ];
};