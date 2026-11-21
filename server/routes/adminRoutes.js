
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getSellerApplications,
  getSellerApplicationById,
  approveSellerApplication,
  rejectSellerApplication,
} = require("../controllers/adminController");
const {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  softDeleteAdminProduct,
  restoreAdminProduct,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminInventory,
  updateAdminInventory,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminUsers,
  getAdminUserDetails,
  setAdminUserStatus,
  getAdminReviews,
  deleteAdminReview,
  getAdminPayments,
  updateAdminPaymentStatus,
  getAdminCoupons,
  saveAdminCoupon,
  deleteAdminCoupon,
  getAdminAnalytics,
  getAdminSettings,
  updateAdminSettings,
  getAdminActivity,
  getCloudinarySignature,
  askOpenAi,
} = require("../controllers/adminManagementController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All routes require an authenticated admin
router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);

// Get all seller applications
router.get("/seller-applications", getSellerApplications);

// Get one seller application
router.get("/seller-applications/:id", getSellerApplicationById);

// Approve seller application
router.put("/seller-applications/:id/approve", approveSellerApplication);

// Reject seller application
router.put("/seller-applications/:id/reject", rejectSellerApplication);

router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", softDeleteAdminProduct);
router.put("/products/:id/restore", restoreAdminProduct);

router.get("/categories", getAdminCategories);
router.post("/categories", createAdminCategory);
router.put("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);

router.get("/inventory", getAdminInventory);
router.put("/inventory/:id", updateAdminInventory);

router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateAdminOrderStatus);

router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserDetails);
router.put("/users/:id/status", setAdminUserStatus);

router.get("/reviews", getAdminReviews);
router.delete("/products/:productId/reviews/:reviewId", deleteAdminReview);

router.get("/payments", getAdminPayments);
router.put("/payments/:id/status", updateAdminPaymentStatus);

router.get("/coupons", getAdminCoupons);
router.post("/coupons", saveAdminCoupon);
router.put("/coupons/:id", saveAdminCoupon);
router.delete("/coupons/:id", deleteAdminCoupon);

router.get("/analytics", getAdminAnalytics);
router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);
router.get("/activity", getAdminActivity);
router.get("/cloudinary/signature", getCloudinarySignature);
router.post("/ai/ask", askOpenAi);

module.exports = router;
