// src/agents/flights/amadeus.token.js
import axios from "axios";

// Token cache in memory to reduce calls
let cachedToken = null;
let tokenExpiry = null;

export const getAmadeusToken = async () => {
  const now = Date.now();

  // If a valid token exists, reuse it
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    cachedToken = res.data.access_token;
    tokenExpiry = now + res.data.expires_in * 1000 - 60 * 1000; // 1 min buffer

    console.log("Amadeus token refreshed");
    return cachedToken;
  } catch (error) {
    console.error("Amadeus Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch Amadeus access token");
  }
};
