
const express = require("express");

const router = express.Router();

const {
  getProducts,
  getMyProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public product browsing
router.get("/", getProducts);
router.get("/seller/mine", protect, sellerOnly, getMyProducts);
router.get("/:id", getProductById);

// Only approved sellers can create products
router.post("/", protect, sellerOnly, createProduct);
router.post("/:id/reviews", protect, addProductReview);

// Logged-in users reach the controller;
// it checks seller ownership or admin permission.
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
