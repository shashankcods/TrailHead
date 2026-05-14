import axios from "axios";

export const getSafetyData = async (destination) => {
  try {
    // Clean up destination
    let cleanDestination = destination;
    if (typeof destination === "string") {
      cleanDestination = destination.split(",")[0].trim();
    }
    console.log(`Cleaned destination for Safety Agent: ${cleanDestination}`);

    // Geocode via OpenRouteService
    const orsRes = await axios.get("https://api.openrouteservice.org/geocode/search", {
      params: { api_key: process.env.ORS_API_KEY, text: cleanDestination },
    });

    const location = orsRes.data.features?.[0];
    if (!location) throw new Error("Destination not found in ORS");

    const latitude = location.geometry.coordinates[1];
    const longitude = location.geometry.coordinates[0];
    const country = location.properties.country || "Unknown";

    console.log(`ORS Geocoded ${cleanDestination} → ${latitude}, ${longitude} (${country})`);

    // Dynamic radius computation via Open-Meteo
    let radiusKm = 5;
    try {
      const geoRes = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { name: cleanDestination },
      });

      const geoData = geoRes.data.results?.[0];
      if (geoData?.bounding_box) {
        const { south, north, west, east } = geoData.bounding_box;
        const EARTH_RADIUS = 6371;
        const latDistance = (north - south) * (Math.PI / 180) * EARTH_RADIUS;
        const lonDistance =
          (east - west) *
          (Math.PI / 180) *
          EARTH_RADIUS *
          Math.cos((latitude * Math.PI) / 180);
        radiusKm = Math.max(latDistance, lonDistance) / 3;
      } else if (geoData?.population) {
        if (geoData.population > 10000000) radiusKm = 10;
        else if (geoData.population > 1000000) radiusKm = 7;
        else if (geoData.population > 200000) radiusKm = 5;
        else radiusKm = 3;
      } else {
        console.warn("Bounding box and population unavailable — using default 5 km radius");
      }

      radiusKm = Math.min(Math.max(radiusKm, 2), 15);
    } catch (err) {
      console.warn("Open-Meteo geocoding failed — using default 5 km radius");
    }

    const radius = radiusKm * 1000;

    // Numbeo scraping for safety data
    const pageUrl = `https://www.numbeo.com/crime/in/${encodeURIComponent(cleanDestination)}`;
    console.log(`🔎 Fetching Numbeo data from: ${pageUrl}`);

    const html = (await axios.get(pageUrl)).data;
    let crimeMatch = html.match(/Crime Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);
    let safetyMatch = html.match(/Safety Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);

    let crimeIndex = crimeMatch ? parseFloat(crimeMatch[1]) : null;
    let safetyIndex = safetyMatch ? parseFloat(safetyMatch[1]) : null;

    // Alternate URL attempt (for hyphenated city pages)
    if (crimeIndex === null || safetyIndex === null) {
      const altUrl = `https://www.numbeo.com/crime/in/${encodeURIComponent(
        cleanDestination.replace(/\s+/g, "-")
      )}`;
      try {
        console.warn(`${cleanDestination} not found in Numbeo — trying alternate URL.`);
        const altHtml = (await axios.get(altUrl)).data;
        const cAlt = altHtml.match(/Crime Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);
        const sAlt = altHtml.match(/Safety Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);
        if (cAlt) crimeIndex = parseFloat(cAlt[1]);
        if (sAlt) safetyIndex = parseFloat(sAlt[1]);
        if (crimeIndex && safetyIndex)
          console.log(`Found Numbeo data via alternate URL: ${altUrl}`);
      } catch (err) {
        console.warn("Alternate Numbeo lookup failed:", err.message);
      }
    }

    // 🇨🇮 STEP 6: Country-level fallback
    if (crimeIndex === null || safetyIndex === null) {
      console.warn(`${cleanDestination} not found — using ${country} averages instead.`);
      try {
        const countryUrl = `https://www.numbeo.com/crime/in/${encodeURIComponent(country)}`;
        const countryHtml = (await axios.get(countryUrl)).data;
        const cMatch = countryHtml.match(/Crime Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);
        const sMatch = countryHtml.match(/Safety Index[^<]*<\/td>\s*<td[^>]*>\s*([\d.]+)/i);
        if (cMatch) crimeIndex = parseFloat(cMatch[1]);
        if (sMatch) safetyIndex = parseFloat(sMatch[1]);
      } catch (err) {
        console.warn(`Failed to fetch country-level safety data for ${country}:`, err.message);
      }
    }

    // Hardcoded fallback safety dataset
    const fallbackSafety = {
      India: { crimeIndex: 44.11, safetyIndex: 55.89 },
      Japan: { crimeIndex: 24.59, safetyIndex: 75.41 },
      "United States": { crimeIndex: 49.02, safetyIndex: 50.98 },
      "United Kingdom": { crimeIndex: 46.07, safetyIndex: 53.93 },
      Canada: { crimeIndex: 39.23, safetyIndex: 60.77 },
      Australia: { crimeIndex: 43.03, safetyIndex: 56.97 },
      France: { crimeIndex: 51.99, safetyIndex: 48.01 },
      Germany: { crimeIndex: 35.79, safetyIndex: 64.21 },
      "United Arab Emirates": { crimeIndex: 16.34, safetyIndex: 83.66 },
      Singapore: { crimeIndex: 25.29, safetyIndex: 74.71 },
    };

    if (!crimeIndex || !safetyIndex) {
      const fb = fallbackSafety[country];
      if (fb) {
        crimeIndex = fb.crimeIndex;
        safetyIndex = fb.safetyIndex;
        console.warn(`Using hardcoded safety data for ${country}`);
      }
    }

    const citySafety = { crimeIndex, safetyIndex };

    // Overpass API — local infrastructure count
    const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["amenity"="hospital"](around:${radius},${latitude},${longitude});
        nwr["healthcare"="hospital"](around:${radius},${latitude},${longitude});
        nwr["amenity"="police"](around:${radius},${latitude},${longitude});
        nwr["amenity"="fire_station"](around:${radius},${latitude},${longitude});
      );
      out center;
    `;

    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const overpassRes = await axios.post(overpassUrl, overpassQuery, {
      headers: { "Content-Type": "text/plain" },
    });

    const elements = overpassRes.data.elements || [];
    const localSafety = {
      radiusKm: Number(radiusKm.toFixed(2)),
      hospitals: elements.filter((e) => e.tags?.amenity === "hospital").length,
      policeStations: elements.filter((e) => e.tags?.amenity === "police").length,
      fireStations: elements.filter((e) => e.tags?.amenity === "fire_station").length,
    };

    // Safety summary
    let safetyWord = "moderately safe";
    if (citySafety.safetyIndex >= 70) safetyWord = "very safe";
    else if (citySafety.safetyIndex < 50) safetyWord = "less safe";

    const summary = `${cleanDestination} is ${safetyWord} with a safety index of ${citySafety.safetyIndex}. Within ${localSafety.radiusKm} km: ${localSafety.hospitals} hospitals, ${localSafety.policeStations} police stations, and ${localSafety.fireStations} fire stations.`;

    // Return result
    return { destination: cleanDestination, country, citySafety, localSafety, summary };
  } catch (error) {
    console.error("Safety Service Error:", error.message || error);
    throw error;
  }
};
