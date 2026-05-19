import express from "express";
import { orchestrateTrip } from "../controllers/orchestrator.controller.js";

const router = express.Router();

router.post("/", orchestrateTrip);

export default router;
