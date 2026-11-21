
const express = require("express");
const router = express.Router();

const {
  updateProfile,
  verifyCurrentPassword,
  changePassword,
  submitSellerApplication,
  getMySellerApplication,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Profile management
router.put("/profile", protect, updateProfile);

// Password management
router.post("/verify-password", protect, verifyCurrentPassword);
router.put("/change-password", protect, changePassword);

// Seller application
router.post("/seller-application", protect, submitSellerApplication);
router.get("/seller-application", protect, getMySellerApplication);

module.exports = router;
