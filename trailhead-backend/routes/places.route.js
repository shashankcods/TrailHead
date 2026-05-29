import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { getPlacePhoto } from "../controllers/places.controller.js";

const router = express.Router();

router.get("/photo", asyncHandler(getPlacePhoto));

export default router;
