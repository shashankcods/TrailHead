import express from "express";
import { getAccommodation } from "../controllers/accommodation.controller.js";

const router = express.Router();

router.get("/", getAccommodation);

export default router;
