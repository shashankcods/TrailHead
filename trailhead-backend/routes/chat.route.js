import { Router } from "express";
import { postTripChat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", postTripChat);

export default router;
