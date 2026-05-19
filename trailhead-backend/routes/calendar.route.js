import express from "express";
import { createCalendar } from "../controllers/calendar.controller.js";

const router = express.Router();

router.post("/", createCalendar);

export default router;
