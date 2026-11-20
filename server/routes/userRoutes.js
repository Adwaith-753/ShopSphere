
const express = require("express");
const router = express.Router();

const {
  updateProfile,
  verifyCurrentPassword,
  changePassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Update logged-in user's profile
router.put("/profile", protect, updateProfile);

// Verify current password
router.post("/verify-password", protect, verifyCurrentPassword);

// Change password after verification
router.put("/change-password", protect, changePassword);

module.exports = router;
