import axios from "axios";

export const getFlights = async (source, destination, start_date, end_date) => {
  try {
    const query = `round trip flights from ${source} to ${destination} best deals site:makemytrip.com OR site:ixigo.com`;

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: query,
        api_key: process.env.SERPAPI_KEY,
        gl: "in",
        hl: "en",
        num: 10,
      },
      timeout: 20000,
    });

    const results = response.data.organic_results || [];

    if (!results.length) {
      return {
        route: `${source} ↔ ${destination}`,
        outboundDate: start_date,
        returnDate: end_date,
        message: "No flights found. Try a closer date or nearby city.",
      };
    }

    // Regex pattern to match Indian currency amounts (₹ or Rs.)
    const priceRegex = /₹\s?([\d,]+)/g;

    const flights = results.map((r) => {
      const snippet = r.snippet || "";
      const prices = [...snippet.matchAll(priceRegex)].map((match) =>
        parseInt(match[1].replace(/,/g, ""), 10)
      );

      const minPrice = prices.length ? Math.min(...prices) : null;
      const maxPrice = prices.length ? Math.max(...prices) : null;

      return {
        title: r.title || "N/A",
        snippet: snippet || "No description available.",
        link: r.link || null,
        displayed_link: r.displayed_link || null,
        priceRange: prices.length
          ? `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
          : "Not mentioned",
      };
    });

    return {
      route: `${source} ↔ ${destination}`,
      outboundDate: start_date,
      returnDate: end_date,
      totalResults: flights.length,
      flights,
    };
  } catch (error) {
    console.error("SerpAPI (MMT/Ixigo) Service Error:", {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error("Failed to fetch round-trip flight data from MakeMyTrip/Ixigo via SerpAPI");
  }
};
