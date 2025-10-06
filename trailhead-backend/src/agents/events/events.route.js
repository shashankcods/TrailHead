import express from "express";
import { fetchEvents } from "./events.controller.js";

const router = express.Router();
router.get("/", fetchEvents);

export default router;
