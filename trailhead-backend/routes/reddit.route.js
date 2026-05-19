import express from "express";
import { getTripAdvice } from "../controllers/reddit.controller.js";

const router = express.Router();

router.get("/", getTripAdvice);

export default router;
