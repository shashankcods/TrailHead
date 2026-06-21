import express from "express";
import { getRoute, autocompleteCity } from "../controllers/maps.controller.js"; // Import controller func

// Init express router
const router = express.Router();

router.get("/", getRoute);
router.get("/autocomplete", autocompleteCity);

export default router;
