import express from "express";
import { getSafetyInfo } from "../controllers/safety.controller.js"; // Import controller func

// Init express router
const router = express.Router();

router.get("/", getSafetyInfo);

export default router;
