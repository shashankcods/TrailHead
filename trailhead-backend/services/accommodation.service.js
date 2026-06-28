import axios from "axios";
import APIError from "../utils/APIError.js";

const SERPAPI_BASE_URL =
  "https://serpapi.com/search?engine=google_hotels";

const SERPAPI_KEY =
  process.env.SERPAPI_KEY;

// =========================
// Hotel Score Formula
// =========================

const calculateHotelScore = (hotel) => {
  const rating = hotel.overall_rating || 0;
  const reviews = hotel.reviews || 1;
  // Quality-first: high rating + many reviews = higher score, price not penalised
  return rating * 2 + Math.log10(reviews);
};


// =========================
// Parse Price Safely
// =========================

const parsePrice = (
  priceString
) => {

  if (!priceString)
    return null;

  const parsed =
    Number(
      priceString.replace(
        /[^0-9.]/g,
        ""
      )
    );

  return isNaN(parsed)
    ? null
    : parsed;
};


// =========================
// Main Hotel Service
// =========================

export const getHotelsFromBooking = async (

  destination,

  checkin_date,

  checkout_date,

  minBudget = 0,

  maxBudget = 500,

  adults = 2,

  limit = 10,
  
  currency = "USD"
) => {

  try {

    const res =
      await axios.get(
        SERPAPI_BASE_URL,
        {
          params: {

            engine:
              "google_hotels",

            q:
              `${destination} hotels`,

            check_in_date:
              checkin_date,

            check_out_date:
              checkout_date,

            adults,

            currency,

            api_key:
              SERPAPI_KEY,
          },
        }
      );

    let hotels =
      res.data.properties || [];

    if (!hotels.length) {
      throw new APIError(
        404,
        `No hotels found for ${destination}`
      );
    }

    // =========================
    // Budget Filtering (floor = 0, ceiling = maxBudget)
    // =========================

    const budgetFilteredHotels = hotels.filter((h) => {
      const price = parsePrice(h.rate_per_night?.lowest);
      if (!price) return false;
      return price <= maxBudget;
    });

    // Fallback: if nothing fits the ceiling, return all sorted cheapest-first
    const finalHotels = budgetFilteredHotels.length > 0
      ? budgetFilteredHotels
      : [...hotels].sort((a, b) => (parsePrice(a.rate_per_night?.lowest) ?? Infinity) - (parsePrice(b.rate_per_night?.lowest) ?? Infinity));

    // =========================
    // Ranking — quality-first, premium options surface before budget ones
    // =========================

    const rankedHotels = finalHotels
      .map((h) => ({
        ...h,
        parsed_price: parsePrice(h.rate_per_night?.lowest),
        weighted_score: calculateHotelScore(h),
      }))
      .sort((a, b) => {
        // Primary: quality score descending
        const scoreDiff = b.weighted_score - a.weighted_score;
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
        // Tiebreak: higher price first (more premium)
        return (b.parsed_price ?? 0) - (a.parsed_price ?? 0);
      })
      .slice(0, limit);

    // =========================
    // Clean Response
    // =========================

    const cleanedHotels =
      rankedHotels.map((h) => ({
        name: h.name,
        description: h.description || null,
        overall_rating: h.overall_rating || null,
        reviews: h.reviews || 0,
        score: Number(h.weighted_score.toFixed(2)),
        price_per_night: h.parsed_price,
        currency,
        type: h.type || null,
        amenities: h.amenities || [],
        check_in_time: h.check_in_time || null,
        check_out_time: h.check_out_time || null,
        images: h.images || [],
        thumbnail: h.images?.[0] || null,
        gps_coordinates: h.gps_coordinates || null,
        nearby_places: h.nearby_places || [],
        hotel_class: h.hotel_class || null,
        extracted_hotel_class: h.extracted_hotel_class || null,
        link: h.link || null,
      }));

    return {
      destination,
      checkin_date,
      checkout_date,
      adults,
      requestedResults: limit,
      budgetRange: {
        min: minBudget,
        max: maxBudget,
      },
      total_results: cleanedHotels.length,
      hotels: cleanedHotels,
    };

  } catch (err) {

    console.error(
      "[Hotels] Service Error:",
      err.response?.data
      || err.message
    );

    throw new APIError(
      err.statusCode || 500,
      "Failed to fetch hotels"
    );
  }
};
