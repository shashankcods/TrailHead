import express from "express";
import { getRoute } from "./maps.controller.js";

const router = express.Router();

router.get("/", getRoute);

export default router;
