import axios from "axios";
import APIError from "../utils/APIError.js";
import airportCodes from "../utils/airportCodes.js";

// =========================
// Airport resolution
// =========================

const resolveAirports = (source, destination) => {
  const departure_id = airportCodes[source.toLowerCase()];
  const arrival_id = airportCodes[destination.toLowerCase()];

  if (!departure_id || !arrival_id) {
    throw new APIError(400, "Unsupported city");
  }

  console.log(
    `Resolved Airports: ${source} → ${departure_id}, ${destination} → ${arrival_id}`
  );

  return { departure_id, arrival_id };
};

// =========================
// Google Flights deep link
// =========================

export const buildFlightSearchUrl = ({
  departureAirport,
  arrivalAirport,
  outboundDate,
  returnDate,
  adults = 1,
  currency = "USD",
}) => {
  const baseUrl = "https://www.google.com/travel/flights";
  const url = new URL(baseUrl);

  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("curr", currency);

  // Build proper tfs (Travel Flight Search) parameter
  if (departureAirport && arrivalAirport) {
    let tfs = "CAEQAhoGCAUQARgBIAEoAToHCgYIBhABGAEiAggCEgYIBhABGAEiAggC";
    tfs += `:${departureAirport}*${arrivalAirport}`;
    if (outboundDate) {
      tfs += `:${outboundDate}`;
    }
    if (returnDate) {
      tfs += `*${returnDate}`;
    }
    url.searchParams.set("tfs", tfs);
  }

  return url.toString();
};

// =========================
// Flights metadata (live or fallback)
// =========================

const buildBudgetRange = (min_budget, max_budget) => {
  const min =
    min_budget != null && Number.isFinite(Number(min_budget))
      ? Number(min_budget)
      : undefined;
  const max =
    max_budget != null && Number.isFinite(Number(max_budget))
      ? Number(max_budget)
      : undefined;

  if (min == null && max == null) return undefined;
  if (min === 0 && max === 0) return undefined;

  return {
    ...(min != null ? { min } : {}),
    ...(max != null ? { max } : {}),
  };
};

export const buildFlightsMetadata = ({
  source,
  destination,
  departureAirport,
  arrivalAirport,
  outboundDate,
  returnDate,
  adults = 1,
  limit = 10,
  min_budget,
  max_budget,
  currency = "USD",
  flights = [],
}) => {
  const budgetRange = buildBudgetRange(min_budget, max_budget);

  return {
    route: `${source} ↔ ${destination}`,
    departureAirport,
    arrivalAirport,
    outboundDate,
    returnDate,
    adults,
    currency,
    requestedResults: limit,
    bookingLink: buildFlightSearchUrl({
      departureAirport,
      arrivalAirport,
      outboundDate,
      returnDate,
      adults,
      currency,
    }),
    ...(budgetRange ? { budgetRange } : {}),
    totalResults: flights.length,
    flights,
  };
};

export const buildFlightsFallback = ({
  source,
  destination,
  start_date,
  end_date,
  adults = 1,
  limit = 10,
  min_budget,
  max_budget,
  currency = "USD",
}) => {
  const { departure_id, arrival_id } = resolveAirports(source, destination);

  return buildFlightsMetadata({
    source,
    destination,
    departureAirport: departure_id,
    arrivalAirport: arrival_id,
    outboundDate: start_date,
    returnDate: end_date,
    adults,
    limit,
    min_budget,
    max_budget,
    currency,
    flights: [],
  });
};

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
  adults = 1,
  limit = 10,
  currency = "USD"
) => {
  let departure_id;
  let arrival_id;

  try {
    ({ departure_id, arrival_id } = resolveAirports(source, destination));
  } catch (error) {
    throw error;
  }

  const metadataBase = {
    source,
    destination,
    departureAirport: departure_id,
    arrivalAirport: arrival_id,
    outboundDate: start_date,
    returnDate: end_date,
    adults,
    limit,
    min_budget,
    max_budget,
    currency,
  };

  try {
    const timeoutMs = parseInt(process.env.FLIGHTS_API_TIMEOUT_MS || "45000", 10);
    const params = {
      engine: "google_flights",
      departure_id,
      arrival_id,
      outbound_date: start_date,
      return_date: end_date,
      adults,
      currency,
      hl: "en",
      gl: "us",
    };

    console.log(`[Flights] Using provider: serpapi`);
    console.log(`[Flights] Request params:`, { ...params, api_key: "***REDACTED***" });
    console.log(`[Flights] Timeout set to: ${timeoutMs}ms`);

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        ...params,
        api_key: process.env.SERPAPI_KEY,
      },
      timeout: timeoutMs,
    });

    console.log(`[Flights] Response status: ${response.status}`);
    console.log(`[Flights] Response keys:`, Object.keys(response.data));
    console.log(`[Flights] best_flights count: ${response.data.best_flights?.length ?? 0}`);
    console.log(`[Flights] other_flights count: ${response.data.other_flights?.length ?? 0}`);

    let flights = [
      ...(response.data.best_flights || []),
      ...(response.data.other_flights || []),
    ];

    if (!flights.length) {
      console.warn(`[Flights] No live flights returned; using metadata fallback.`);
      return buildFlightsMetadata({ ...metadataBase, flights: [] });
    }

    flights = flights.map((f) => {
      const firstLeg = f.flights?.[0];
      const lastLeg = f.flights?.[f.flights.length - 1];
      const totalPrice = f.price || null;

      return {
        airline: firstLeg?.airline || "Unknown",
        airlineLogo: firstLeg?.airline_logo || null,
        departureAirport: firstLeg?.departure_airport?.name || null,
        departureAirportCode: firstLeg?.departure_airport?.id || null,
        departureTime: firstLeg?.departure_airport?.time || null,
        arrivalAirport: lastLeg?.arrival_airport?.name || null,
        arrivalAirportCode: lastLeg?.arrival_airport?.id || null,
        arrivalTime: lastLeg?.arrival_airport?.time || null,
        totalDuration: f.total_duration || null,
        layovers: f.layovers || [],
        stops: f.layovers?.length || 0,
        travelClass: firstLeg?.travel_class || null,
        carbonEmissions: f.carbon_emissions?.this_flight || null,
        bookingToken: f.booking_token || null,
        price: totalPrice,
        totalEstimatedPrice: totalPrice ? totalPrice * adults : null,
        flights: f.flights || [],
      };
    });

    console.log(`[Flights] Mapped flights count: ${flights.length}`);

    // Removed strict budget filtering to show more results
    flights = flights.slice(0, limit);

    if (!flights.length) {
      console.warn(`[Flights] No flights after filtering/slicing; using metadata fallback.`);
      return buildFlightsMetadata({ ...metadataBase, flights: [] });
    }

    console.log(`[Flights] Returning ${flights.length} flights`);
    return buildFlightsMetadata({ ...metadataBase, flights });
  } catch (error) {
    console.error(`[Flights] Service Error:`, error.response?.data || error.message);
    console.warn(`[Flights] API failed; using metadata fallback.`);
    return buildFlightsMetadata({ ...metadataBase, flights: [] });
  }
};
