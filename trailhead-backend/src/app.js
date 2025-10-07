// Import express framework for the server
import express from "express";
// import cors from "cors";  // will be used at the end, keep commented for now

// Import route handlers for each agent
import mapsRoute from "./agents/maps/maps.route.js";
import orchestratorRoute from "./orchestrator/orchestrator.route.js";
import weatherRoute from "./agents/weather/weather.route.js";
import eventsRoute from "./agents/events/events.route.js";
import foodRoute from "./agents/food/food.route.js";
import redditRoute from "./agents/reddit/reddit.route.js";
import accommodationRoute from "./agents/accommodation/accommodation.route.js";

// Auth route
import authRoute from "./agents/auth/auth.route.js";

// Initialize express app instance
const app = express();


// app.use(cors());
app.use(express.json());  // Parse incoming JSON automatically

// Dfalt route to check if the backedn is running
app.get("/", (req, res) => {
    res.send("TrailHead is live");
});

// Auth routes(register/login/profile)
app.use("/api/auth", authRoute);

// Adding all the agent routes under their own base URL
app.use("/api/maps", mapsRoute);
app.use("/api/weather", weatherRoute);
app.use("/api/events", eventsRoute);
app.use("/api/food", foodRoute);
app.use("/api/reddit", redditRoute);
app.use("/api/accommodation", accommodationRoute);
app.use("/api/orchestrator", orchestratorRoute);


// Export the app to be used in server.js
export default app;