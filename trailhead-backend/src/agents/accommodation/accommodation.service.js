import axios from "axios";

const RAPID_API_HOST = "booking-com.p.rapidapi.com";
const RAPID_API_KEY = process.env.RAPIDAPI_KEY;

// Get destination ID for the city
const getCityId = async (city) => {
  try {
    const res = await axios.get(`https://${RAPID_API_HOST}/v1/hotels/locations`, {
      params: { name: city, locale: "en-gb" },
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
    });

    if (res.data?.length > 0) return res.data[0].dest_id;
    throw new Error("City not found");
  } catch (err) {
    console.error("City lookup failed:", err.message);
    throw new Error("City lookup failed");
  }
};

// Clean hotel data
const cleanHotelData = (hotels, checkin, checkout) => {
  if (!hotels || hotels.length === 0) return [];

  return hotels.slice(0, 5).map((h) => ({
    hotel_name: h.hotel_name,
    address: h.address,
    city: h.city_trans,
    country: h.country_trans,
    rating: h.review_score,
    price: h.price_breakdown?.gross_price || null,
    currency: h.composite_price_breakdown?.gross_amount_per_night?.currency || "INR",
    distance_from_center: h.distance,
    image_url: h.max_photo_url || h.main_photo_url,
    checkin_date: checkin,
    checkout_date: checkout,
  }));
};

export const getHotelsFromBooking = async (city, checkin_date, checkout_date) => {
  try {
    const dest_id = await getCityId(city);

    const res = await axios.get(`https://${RAPID_API_HOST}/v1/hotels/search`, {
      params: {
        dest_id,
        dest_type: "city",
        checkin_date,
        checkout_date,
        adults_number: "2",
        room_number: "1",
        order_by: "popularity",
        locale: "en-gb",
        filter_by_currency: "INR",
        units: "metric"
      },
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
    });

    // Return only cleaned data
    return {
      city,
      checkin_date,
      checkout_date,
      total_results: res.data.result?.length || 0,
      hotels: cleanHotelData(res.data.result, checkin_date, checkout_date),
    };
  } catch (error) {
    console.error("Accommodation Service Error:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};
