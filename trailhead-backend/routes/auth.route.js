import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getProfile,
  googleAuth,
  googleCallback,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyToken, logoutUser);
router.get("/profile", verifyToken, getProfile);

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
