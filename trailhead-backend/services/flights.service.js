import axios from "axios";
import APIError from "../utils/APIError.js";
import airportCodes from "../utils/airportCodes.js";


// =========================
// Main Flight Service
// =========================

export const getFlights = async (

  source,
  destination,

  start_date,
  end_date,

  min_budget = 100,
  max_budget = 2000,

  adults = 1
) => {

  try {

    // =========================
    // Airport Resolution
    // =========================

    const departure_id =
      airportCodes[
        source.toLowerCase()
      ];

    const arrival_id =
      airportCodes[
        destination.toLowerCase()
      ];

    if (
      !departure_id
      ||
      !arrival_id
    ) {

      throw new APIError(
        400,
        "Unsupported city"
      );
    }

    console.log(
      `Resolved Airports: ${source} → ${departure_id}, ${destination} → ${arrival_id}`
    );

    // =========================
    // Google Flights API
    // =========================

    const response =
      await axios.get(
        "https://serpapi.com/search.json",
        {
          params: {

            engine:
              "google_flights",

            departure_id,

            arrival_id,

            outbound_date:
              start_date,

            return_date:
              end_date,

            adults,

            currency:
              "USD",

            hl:
              "en",

            gl:
              "us",

            api_key:
              process.env.SERPAPI_KEY,
          },

          timeout:
            30000,
        }
      );

    let flights = [

      ...(response.data.best_flights || []),

      ...(response.data.other_flights || []),
    ];

    if (!flights.length) {

      throw new APIError(
        404,
        "No flights found"
      );
    }

    // =========================
    // Normalize Flights
    // =========================

    flights = flights.map((f) => {

      const firstLeg =
        f.flights?.[0];

      const lastLeg =
        f.flights?.[
          f.flights.length - 1
        ];

      const totalPrice =
        f.price || null;

      return {

        airline:
          firstLeg?.airline
          || "Unknown",

        airlineLogo:
          firstLeg?.airline_logo
          || null,

        departureAirport:
          firstLeg?.departure_airport
            ?.name || null,

        departureAirportCode:
          firstLeg?.departure_airport
            ?.id || null,

        departureTime:
          firstLeg?.departure_airport
            ?.time || null,

        arrivalAirport:
          lastLeg?.arrival_airport
            ?.name || null,

        arrivalAirportCode:
          lastLeg?.arrival_airport
            ?.id || null,

        arrivalTime:
          lastLeg?.arrival_airport
            ?.time || null,

        totalDuration:
          f.total_duration || null,

        layovers:
          f.layovers || [],

        stops:
          f.layovers?.length || 0,

        travelClass:
          firstLeg?.travel_class
          || null,

        carbonEmissions:
          f.carbon_emissions
            ?.this_flight || null,

        bookingToken:
          f.booking_token || null,

        price:
          totalPrice,

        totalEstimatedPrice:
          totalPrice
            ? totalPrice * adults
            : null,

        flights:
          f.flights || [],
      };
    });

    // =========================
    // Budget Filtering
    // =========================

    flights = flights.filter((f) => {

      if (!f.price)
        return false;

      return (

        f.price >= min_budget

        &&

        f.price <= max_budget
      );
    });

    // =========================
    // Limit Results
    // =========================

    flights = flights
      .slice(0, 10);

    return {

      route:
        `${source} ↔ ${destination}`,

      departureAirport:
        departure_id,

      arrivalAirport:
        arrival_id,

      outboundDate:
        start_date,

      returnDate:
        end_date,

      adults,

      currency:
        "USD",
    
      bookingLink:
        `https://www.google.com/travel/flights?q=Flights%20from%20${departure_id}%20to%20${arrival_id}%20on%20${start_date}%20return%20${end_date}`,

      budgetRange: {

        min:
          min_budget,

        max:
          max_budget,
      },

      totalResults:
        flights.length,

      flights,
    };

  } catch (error) {

    console.error(
      "Flights Service Error:",
      error.response?.data
      || error.message
    );

    throw new APIError(
      error.statusCode || 500,
      "Failed to fetch flight data"
    );
  }
};