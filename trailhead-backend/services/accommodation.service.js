import axios from "axios";
import APIError from "../utils/APIError.js";

const SERPAPI_BASE_URL =
  "https://serpapi.com/search?engine=google_hotels";

const SERPAPI_KEY =
  process.env.SERPAPI_KEY;

// =========================
// Hotel Score Formula
// =========================

const calculateHotelScore = (

  hotel,

  price
) => {

  const rating =
    hotel.overall_rating || 0;

  const reviews =
    hotel.reviews || 1;

  return (

    (
      rating * 2
      +
      Math.log10(reviews)
    )

    /

    Math.log10(price || 100)
  );
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

  minBudget = 50,

  maxBudget = 500,

  adults = 2,

  limit = 10,
  
  currency = "USD"
) => {

  console.log("[Hotels] Selected currency:", currency);
  console.log("[Hotels] minBudget received:", minBudget);
  console.log("[Hotels] maxBudget received:", maxBudget);

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

    console.log("[Hotels] Raw hotels count before filtering:", hotels.length);

    if (hotels.length > 0) {
      const samplePrice = hotels[0].rate_per_night?.lowest;
      console.log("[Hotels] Sample hotel price string:", samplePrice);
      const parsedSample = parsePrice(samplePrice);
      console.log("[Hotels] Parsed sample price:", parsedSample);
    }

    if (!hotels.length) {
      throw new APIError(
        404,
        `No hotels found for ${destination}`
      );
    }

    // =========================
    // Budget Filtering
    // =========================

    const budgetFilteredHotels = hotels.filter((h) => {
      const price = parsePrice(h.rate_per_night?.lowest);
      if (!price)
        return false;
      return (
        price >= minBudget
        &&
        price <= maxBudget
      );
    });

    console.log("[Hotels] Hotels count after budget filtering:", budgetFilteredHotels.length);

    if (budgetFilteredHotels.length === 0) {
      console.log("[Hotels] No hotels matched budget; returning unfiltered top hotels fallback.");
    }

    const finalHotels = budgetFilteredHotels.length > 0 ? budgetFilteredHotels : hotels;

    // =========================
    // Ranking
    // =========================

    const rankedHotels = finalHotels
      .map((h) => {
        const price = parsePrice(h.rate_per_night?.lowest);
        return {
          ...h,
          parsed_price: price,
          weighted_score: price ? calculateHotelScore(h, price) : 0,
        };
      })
      .sort((a, b) => b.weighted_score - a.weighted_score)
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
