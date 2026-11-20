
const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// console.log("registerUser:", typeof registerUser);
// console.log("loginUser:", typeof loginUser);
// console.log("getMe:", typeof getMe);
// console.log("protect:", typeof protect);

// Customer registration
router.post("/register", registerUser);

// Common login
router.post("/login", loginUser);

// Protected user profile
router.get("/me", protect, getMe);

module.exports = router;
