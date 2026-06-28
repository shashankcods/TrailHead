import { getFlights, buildFlightsFallback }
from "./flights.service.js";

import { getHotelsFromBooking }
from "./accommodation.service.js";

import { getWeatherFromOpenMeteo }
from "./weather.service.js";

import { getTouristAttractions }
from "./attractions.service.js";

import { getRestaurants }
from "./food.service.js";

import { getEvents }
from "./events.service.js";

import { getSafetyData }
from "./safety.service.js";

import APIError
from "../utils/APIError.js";

import { geocodeDestination }
from "../utils/geocode.js";

import { timedServiceCall }
from "../utils/timedServiceCall.js";

import { validateItinerary } from "../utils/validateItinerary.js";

import { normalizeActivities } from "../utils/normalizeActivities.js";

import { generateStructuredItinerary } from "./llm.service.js";

import { compactLLMActivities } from "../utils/compactLLMactivities.js";

import { enrichItinerary } from "../utils/enrichItinerary.js";

import { repairItinerary } from "../utils/repairItinerary.js";

import { normalizeItineraryShape } from "../utils/itineraryShape.js";

import { buildFallbackItinerary } from "../utils/buildFallbackItinerary.js";


// CACHING NEEDS TO BE ADDED FOR SAFETY AS IT IS THE BOTTLENECK


// =========================
// Constants
// =========================

const MAX_WEATHER_FORECAST_DAYS =
  15;

const SERVICE_TIMEOUT =
  30000;


// =========================
// Interest Mapping
// =========================

const INTEREST_MAP = {

  "City Sightseeing":
    "CitySightseeing",

  "Nightlife":
    "Nightlife",

  "Shopping":
    "Shopping",

  "Outdoor Adventures":
    "OutdoorAdventures",

  "Beaches":
    "Beaches",

  "Spa & Wellness":
    "SpaWellness",
};


// =========================
// Timeout Wrapper
// =========================

const withTimeout = (
  promise,
  timeoutMs = SERVICE_TIMEOUT
) => {

  return Promise.race([

    promise,

    new Promise((_, reject) =>

      setTimeout(() =>

        reject(
          new Error(
            "Service timeout"
          )
        ),

        timeoutMs
      )
    ),
  ]);
};


// =========================
// Calculate End Date
// =========================

const calculateEndDate = (
  start_date,
  trip_days
) => {

  const start =
    new Date(start_date);

  const end =
    new Date(start);

  end.setDate(
    end.getDate()
    +
    (trip_days - 1)
  );

  return end
    .toISOString()
    .split("T")[0];
};


// =========================
// Safe Weather End Date
// =========================

const getSafeWeatherEndDate = (
  start_date,
  requested_end_date
) => {

  const maxForecastDate =
    new Date(start_date);

  maxForecastDate.setDate(
    maxForecastDate.getDate()
    +
    MAX_WEATHER_FORECAST_DAYS
  );

  const requested =
    new Date(requested_end_date);

  return requested > maxForecastDate

    ? maxForecastDate
        .toISOString()
        .split("T")[0]

    : requested_end_date;
};


// =========================
// Retrieval Strategy
// =========================

const getRetrievalConfig = (

  trip_days,

  interests = [],

  totalBudget = 0,

  adults = 1
) => {

  const config = {

    attractions:
      trip_days * 4,

    restaurants:
      trip_days * 3,

    events:
      trip_days * 2,

    hotels:
      10,

    flights:
      10,
  };

  // =========================
  // Interest Modifiers
  // =========================

  if (
    interests.includes(
      "Food Exploration"
    )
  ) {

    config.restaurants += 8;
  }

  if (
    interests.includes(
      "Nightlife"
    )
  ) {

    config.events += 5;
  }

  if (
    interests.includes(
      "City Sightseeing"
    )
  ) {

    config.attractions += 6;
  }

  if (
    interests.includes(
      "Outdoor Adventures"
    )
  ) {

    config.attractions += 5;
  }

  if (
    interests.includes(
      "Shopping"
    )
  ) {

    config.attractions += 4;
  }

  // =========================
  // Budget Modifiers
  // =========================

  if (totalBudget > 5000) {

    config.hotels += 5;

    config.restaurants += 5;
  }

  // =========================
  // Group Size Modifiers
  // =========================

  if (adults >= 5) {

    config.restaurants += 5;
  }

  return config;
};


// =========================
// Planner Service
// =========================

export const generateTripPlan = async (
  source,
  destination,
  start_date,
  trip_days,
  adults = 1,
  interests = [],
  budget = {}
) => {

  try {

    // =========================
    // Input Validation
    // =========================

    trip_days =
      Number(trip_days);

    adults =
      Number(adults);

    if (
      !trip_days
      ||
      trip_days <= 0
    ) {

      throw new APIError(
        400,
        "Invalid trip_days"
      );
    }

    if (
      !adults
      ||
      adults <= 0
    ) {

      throw new APIError(
        400,
        "Invalid adults count"
      );
    }

    // =========================
    // Derived Data
    // =========================

    const end_date =
      calculateEndDate(
        start_date,
        trip_days
      );

    const weather_end_date =
      getSafeWeatherEndDate(
        start_date,
        end_date
      );

    const totalBudget =
      budget.total ?? 0;

    const totalBudgetUSD =
      budget.totalUSD ?? totalBudget;

    const selectedCurrency =
      budget.currency ?? "USD";

    const allocations = {

      travel:
        totalBudget
        *
        ((budget.travel ?? 25) / 100),

      travelUSD:
        budget.travelUSD ??
        (totalBudgetUSD
        *
        ((budget.travel ?? 25) / 100)),

      accommodation:
        totalBudget
        *
        ((budget.accommodation ?? 35) / 100),

      food:
        totalBudget
        *
        ((budget.food ?? 20) / 100),

      activities:
        totalBudget
        *
        ((budget.activities ?? 20) / 100),
    };

    // =========================
    // Retrieval Config
    // =========================

    const retrievalConfig =
      getRetrievalConfig(

        trip_days,

        interests,

        totalBudget,

        adults
      );

    // =========================
    // Geocode destination once
    // =========================

    const {
      latitude,
      longitude,
      country,
    } =
      await geocodeDestination(
        destination
      );

    // =========================
    // Parallel Service Calls
    // =========================

    console.time("TOTAL_PLANNER_TIME");

    const serviceResults =
      await Promise.allSettled([

        timedServiceCall(
          "Flights",
          () =>
            withTimeout(
              getFlights(
                source,
                destination,
                start_date,
                end_date,
                allocations.travelUSD * 0.5,
                allocations.travelUSD,
                adults,
                retrievalConfig.flights,
                selectedCurrency,
                "roundTrip",
                allocations.travel * 0.5,
                allocations.travel
              )
            )
        ),

        timedServiceCall(

          "Hotels",

          () =>
            withTimeout(

              getHotelsFromBooking(

                destination,

                start_date,

                end_date,

                0,

                allocations.accommodation
                  / trip_days
                  / adults,

                adults,

                retrievalConfig.hotels,

                selectedCurrency
              )
            )
        ),

        timedServiceCall(

          "Weather",

          () =>
            withTimeout(

              getWeatherFromOpenMeteo(

                destination,

                start_date,

                weather_end_date,

                latitude,

                longitude,

                country
              )
            )
        ),

        timedServiceCall(

          "Restaurants",

          () =>
            withTimeout(

              getRestaurants(

                destination,

                retrievalConfig.restaurants,

                latitude,

                longitude,

                country
              )
            )
        ),

        timedServiceCall(

          "Events",

          () =>
            withTimeout(

              getEvents(

                destination,

                start_date,

                end_date,

                retrievalConfig.events,

                latitude,

                longitude
              )
            )
        ),

        timedServiceCall(

          "Safety",

          () =>
            withTimeout(

              getSafetyData(

                destination,

                latitude,

                longitude,

                country
              )
            )
        ),
      ]);

    const [

      flightsResult,

      hotelsResult,

      weatherResult,

      restaurantsResult,

      eventsResult,

      safetyResult,

    ] = serviceResults;

    let flights =
      flightsResult.status === "fulfilled"
        ? flightsResult.value
        : null;

    if (!flights) {
      try {
        flights = buildFlightsFallback({
          source,
          destination,
          start_date,
          end_date,
          adults,
          limit: retrievalConfig.flights,
          min_budget: 0,
          max_budget: allocations.travel,
          currency: selectedCurrency,
        });
      } catch (fallbackError) {
        console.warn(
          "Flights fallback unavailable:",
          fallbackError?.message ?? fallbackError
        );
      }
    }

    const hotels =
      hotelsResult.status === "fulfilled"
        ? hotelsResult.value
        : null;

    const weather =
      weatherResult.status === "fulfilled"
        ? weatherResult.value
        : null;

    const restaurants =
      restaurantsResult.status === "fulfilled"
        ? restaurantsResult.value
        : [];

    const events =
      eventsResult.status === "fulfilled"
        ? eventsResult.value
        : []

    const safety =
      safetyResult.status === "fulfilled"
        ? safetyResult.value
        : null;

    // =========================
    // Attractions by Interests
    // =========================

    const attractionPromises = interests
      .filter(
        (interest) =>
          ![
            "Food Exploration",
            "Festivals/Events"
          ].includes(interest)
      )
      .map(async (interest) => {

        const mappedInterest =
          INTEREST_MAP[interest]
          || interest;

        try {

          const attractions =
            await withTimeout(

              getTouristAttractions(

                destination,

                mappedInterest,

                retrievalConfig.attractions,

                latitude,

                longitude
              )
            );

          return {
            interest,
            attractions
          };

        } catch (err) {

          console.error(
            `Attractions failed for ${interest}:`,
            err.message
          );

          return {
            interest,
            attractions: null
          };
        }
      });

    console.time("Attractions");

    const attractionResults =
      await Promise.all(attractionPromises);

    console.timeEnd("Attractions");

    const attractionsByInterest = {};

    for (const result of attractionResults) {

      attractionsByInterest[
        result.interest
      ] = result.attractions;
    }

    // =========================
    // Final Unified Context
    // =========================

    console.timeEnd("TOTAL_PLANNER_TIME");

    const activities =
      normalizeActivities({

        attractionsByInterest,

        restaurants,

        events
      });

    const activityMap =
        new Map();

      activities.forEach(
        (activity) => {

          activityMap.set(
            activity.id,
            activity
          );
      });

    const compactActivitiesForLLM = compactLLMActivities(activities);

      let itinerary;

      try {

        itinerary =
          await generateStructuredItinerary({

            trip: {

              source,

              destination,

              start_date,

              end_date,

              adults,

              trip_days
            },

            interests,

            budget: allocations,

            compactActivities:
              compactActivitiesForLLM
          });
      } catch (llmError) {

        console.error(
          "Structured Itinerary Error:",
          llmError?.message ?? llmError
        );

        itinerary = { days: [] };
      }

      itinerary = normalizeItineraryShape(itinerary);

      let validationResult =
        validateItinerary({

          itinerary,
          activityMap
        });

      if (
        !validationResult.valid &&
        itinerary?.days?.length > 0
      ) {

        itinerary =
          repairItinerary({

            itinerary,
            activities,
            activityMap
          });

        itinerary =
          normalizeItineraryShape(itinerary);

        validationResult =
          validateItinerary({

            itinerary,
            activityMap
          });
      }

      if (!validationResult.valid) {

        console.log(
          "[planner] Invalid structured itinerary; using fallback itinerary."
        );

        console.log(
          "[planner] validation errors:",
          validationResult.errors
        );

        itinerary =
          buildFallbackItinerary({

            trip_days,

            destination,

            activities,
          });

        validationResult =
          validateItinerary({

            itinerary,
            activityMap
          });
      }

      if (!validationResult.valid) {

        console.warn(
          "[planner] Fallback itinerary still invalid; using minimal empty-day itinerary."
        );

        console.warn(
          "[planner] validation errors:",
          validationResult.errors
        );

        itinerary =
          buildFallbackItinerary({

            trip_days,

            destination,

            activities: [],
          });
      }

      const enrichedItinerary =
        normalizeItineraryShape(

          enrichItinerary({

            itinerary:
              validationResult.normalizedItinerary
              ?? itinerary,
            activityMap
          })
        );

    const plannerData = {
      trip: {
        source,
        destination,
        start_date,
        end_date,
        trip_days,
        adults,
      },

      interests,

      budgets: {

        total:
          totalBudget,
        totalUSD: totalBudgetUSD,
        currency: selectedCurrency,
        exchangeRate: budget.exchangeRate,
        allocations,
      },

      retrievalConfig,

      flights,

      hotels,

      weather,

      restaurants,

      events,

      safety,

      attractions:
        attractionsByInterest,

      activities,

      compactActivitiesForLLM,

      itinerary: enrichedItinerary ?? { days: [] }
    };
    
    return plannerData

  } catch (error) {

    console.error(
      "Planner Service Error:",
      error.message
    );

    throw error;
  }
};