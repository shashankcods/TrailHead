import express from "express";
import { getFoodOptions }  from "../controllers/food.controller.js";

const router = express.Router();

router.get("/", getFoodOptions);

export default router;