// src/llm/llm.route.js
import express from "express";
import { summarizeTrip } from "./llm.controller.js";

const router = express.Router();
router.post("/summarize", summarizeTrip);
export default router;
