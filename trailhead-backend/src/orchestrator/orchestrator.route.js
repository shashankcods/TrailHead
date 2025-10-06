import express from "express";
import { orchestrateTrip } from "./orchestrator.controller.js";

const router = express.Router();

router.post("/", orchestrateTrip);

export default router;
