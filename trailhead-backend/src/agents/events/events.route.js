import express from "express";
import { fetchEvents } from "./events.controller.js";

// New router for all /api/events endpoints
const router = express.Router();

// fetches data from PredictHQ and Ticketmaster through the events service
router.get("/", fetchEvents);

// Export the router app so app.js can add it under /api/events
export default router;
