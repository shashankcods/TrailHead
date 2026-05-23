import express from "express";

import {
  modifyItineraryController
} from "../controllers/modifyItinerary.controller.js";

const router =
  express.Router();

router.post(

  "/",

  modifyItineraryController
);

export default router;