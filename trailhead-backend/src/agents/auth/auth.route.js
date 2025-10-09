import express from "express";
import { registerUser, loginUser, googleAuth, googleCallback } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes (no login required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Protected Route
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
