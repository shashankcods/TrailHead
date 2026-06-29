// Import express framework for the server
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// Initialize express app instance
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

const plannerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many trip planning requests. Please wait 15 minutes before trying again." },
});

// Import route handlers for each agent
import authRoute from "../routes/auth.route.js";
import mapsRoute from "../routes/maps.route.js";
import weatherRoute from "../routes/weather.route.js";
import eventsRoute from "../routes/events.route.js";
import foodRoute from "../routes/food.route.js";
import accommodationRoute from "../routes/accommodation.route.js";
import safetyRoute from "../routes/safety.route.js";
import flightsRoute from "../routes/flights.route.js";
import calendarRoute from "../routes/calendar.route.js";
import attractionsRoute from "../routes/attractions.route.js";
import plannerRouter from "../routes/planner.route.js";
import modifyItineraryRouter from "../routes/modifyItinerary.route.js";
import placesRoute from "../routes/places.route.js";
import tripsRoute from "../routes/trips.route.js";

// API routes
app.use("/api/auth", authRoute);
app.use("/api/maps", mapsRoute);
app.use("/api/weather", weatherRoute);
app.use("/api/events", eventsRoute);
app.use("/api/food", foodRoute);
app.use("/api/accommodation", accommodationRoute);
app.use("/api/safety", safetyRoute);
app.use("/api/flights", flightsRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/attractions", attractionsRoute);
app.use("/api/planner", plannerLimiter, plannerRouter);
app.use("/api/places", placesRoute);
app.use("/api/trips", tripsRoute);

app.use("/modify-itinerary", modifyItineraryRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// If an /api route is not matched above, return JSON 404.
// This prevents broken API routes from returning React index.html.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Serve calendar_files for direct download
app.use("/calendar_files", express.static("calendar_files"));

// Export the app to be used in server.js
export default app;