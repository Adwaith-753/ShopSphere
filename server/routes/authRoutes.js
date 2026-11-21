
const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");


// Customer registration
router.post("/register", registerUser);

// Common login
router.post("/login", loginUser);

// Protected user profile
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
