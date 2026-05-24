import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);

// TODO(OAuth): Re-enable Google OAuth routes after env/config is set up
// router.get("/google", googleAuth);
// router.get("/google/callback", googleCallback);

router.get("/profile", verifyToken, getProfile);
router.post("/logout", verifyToken, logoutUser);

export default router;
