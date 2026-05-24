import express from "express";
import { getFlightsData }  from "../controllers/flights.controller.js";

const router = express.Router();

router.get("/", getFlightsData);

export default router;