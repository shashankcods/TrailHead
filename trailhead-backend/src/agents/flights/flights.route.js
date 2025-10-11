import express from "express";
import { getFlightsData }  from "./flights.controller.js";

const router = express.Router();

router.get("/", getFlightsData);

export default router;