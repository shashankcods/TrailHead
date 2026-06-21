import express from "express";
import { getRoute } from "../controllers/maps.controller.js"; // Import controller func

// Init express router
const router = express.Router();

router.get("/", getRoute);

export default router;
