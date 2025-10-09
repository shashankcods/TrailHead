import express from "express";
import { registerUser, loginUser } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes (no login required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Route (requires valid JWT)
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
