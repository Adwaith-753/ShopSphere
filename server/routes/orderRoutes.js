const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
} = require("../controllers/orderController");

router.use(protect);
router.post("/", createOrder);
router.post("/coupons/validate", validateCoupon);
router.get("/seller/mine", protect, sellerOnly, getSellerOrders);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);
router.put("/:id/cancel", cancelMyOrder);

module.exports = router;
