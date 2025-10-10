// Import express framework for the server
import express from "express";
// import cors from "cors";  // will be used if needed, keep commented for now
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import "./config/passport.js";

// Import route handlers for each agent
import authRoute from "./agents/auth/auth.route.js";
import mapsRoute from "./agents/maps/maps.route.js";
import orchestratorRoute from "./orchestrator/orchestrator.route.js";
import weatherRoute from "./agents/weather/weather.route.js";
import eventsRoute from "./agents/events/events.route.js";
import foodRoute from "./agents/food/food.route.js";
import redditRoute from "./agents/reddit/reddit.route.js";
import accommodationRoute from "./agents/accommodation/accommodation.route.js";
import safetyRoute from "./agents/safety/safety.route.js";
import llmRoute from "./llm/llm.route.js"

// Initialize express app instance
const app = express();


// app.use(cors());
app.use(express.json());  // Parse incoming JSON automatically

app.use(passport.initialize());

app.post("/testjson", (req, res) => {
  console.log("Body received:", req.body);
  res.json(req.body);
});


// Dfalt route to check if the backedn is running
// app.get("/", (req, res) => {
//     res.send("TrailHead is live");
// });

// Adding all the agent routes under their own base URL
app.use("/api/auth", authRoute);
app.use("/api/maps", mapsRoute);
app.use("/api/weather", weatherRoute);
app.use("/api/events", eventsRoute);
app.use("/api/food", foodRoute);
app.use("/api/reddit", redditRoute);
app.use("/api/accommodation", accommodationRoute);
app.use("/api/safety", safetyRoute)
app.use("/api/orchestrator", orchestratorRoute);
app.use("/api/llm", llmRoute);

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend's built files (trailhead/dist/)
app.use(express.static(path.join(__dirname, "../../trailhead-frontend/dist")));

// Handle React router routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../../trailhead-frontend/dist/index.html"));
});

// Export the app to be used in server.js
export default app;