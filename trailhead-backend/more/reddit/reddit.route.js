import express from "express";
import { getTripAdvice } from "./reddit.controller.js";

const router = express.Router();

router.get("/", getTripAdvice);

export default router;
