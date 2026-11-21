
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

const allowedCategories = [
  "Electronics",
  "Fashion",
  "Accessories",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Books",
];

const getProductCategories = async (req, res) => {
  try {
    const allCategories = await Category.find()
      .select("name imageUrl isActive isDeleted")
      .sort({ name: 1 });
    const categoryMap = new Map(
      allCategories
        .filter((category) => category.isActive && !category.isDeleted)
        .map((category) => [
          category.name,
          { name: category.name, imageUrl: category.imageUrl },
        ])
    );
    for (const name of allowedCategories) {
      if (!allCategories.some((category) => category.name === name)) {
        categoryMap.set(name, { name, imageUrl: "" });
      }
    }
    return res.status(200).json({
      success: true,
      categories: [...categoryMap.values()].sort((first, second) =>
        first.name.localeCompare(second.name)
      ),
    });
  } catch (error) {
    console.error("Get product categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch product categories.",
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your products.",
    });
  }

};

const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort,
      featured,
      trending,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isDeleted: { $ne: true },
      $or: [
        { status: "active" },
        { status: { $exists: false } },
      ],
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$and = [
        {
          $or: [
            { status: "active" },
            { status: { $exists: false } },
          ],
        },
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (trending === "true") {
      filter.isTrending = true;
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));

    let sortOption = { createdAt: -1 };

    if (sort === "price-low") {
      sortOption = { price: 1 };
    } else if (sort === "price-high") {
      sortOption = { price: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name")
        .sort(sortOption)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and category are required.",
      });
    }

    const categoryRecord = await Category.findOne({ name: category })
      .select("isActive isDeleted");
    const categoryExists = categoryRecord
      ? categoryRecord.isActive && !categoryRecord.isDeleted
      : allowedCategories.includes(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category.",
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = stock === undefined ? 0 : Number(stock);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product price.",
      });
    }

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number.",
      });
    }

    const productImages = images === undefined ? [] : images;

    if (!Array.isArray(productImages)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array.",
      });
    }

    if (
      productImages.some(
        (image) =>
          !image ||
          typeof image.url !== "string" ||
          !/^https?:\/\//i.test(image.url)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Every product image must have a valid HTTP or HTTPS URL.",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parsedPrice,
      category,
      images: productImages,
      stock: parsedStock,
      seller: req.user._id,
      status: "active",
      isFeatured: false,
      isTrending: false,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
      $or: [
        { status: "active" },
        { status: { $exists: false } },
      ],
    })
      .populate("seller", "name")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const publicProduct = product.toObject();
    publicProduct.reviews = publicProduct.reviews.map((review) => {
      delete review.isReported;
      delete review.reportReason;
      return review;
    });
    res.status(200).json({
      success: true,
      product: publicProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      product.seller &&
      product.seller.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own products.",
      });
    }

    if (product.isDeleted && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "images",
      "stock",
      "status",
    ];

    if (isAdmin) {
      allowedFields.push("isFeatured", "isTrending");
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      product.seller &&
      product.seller.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products.",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};

const addProductReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const rating = Number(req.body.rating);
    const comment =
      typeof req.body.comment === "string"
        ? req.body.comment.trim()
        : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    const purchasedOrder = await Order.findOne({
      user: req.user._id,
      status: "delivered",
      "items.product": req.params.id,
    });

    if (!purchasedOrder) {
      return res.status(403).json({
        success: false,
        message: "Only customers who received this product can review it.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.reviews.push({
        user: req.user._id,
        rating,
        comment,
      });
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review saved successfully.",
      reviews: product.reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to save the review.",
    });
  }
};

const reportProductReview = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(req.params.reviewId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or review ID.",
      });
    }

    const reason =
      typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    if (reason.length < 5 || reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Explain the issue in 5 to 500 characters.",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });
    const review = product?.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot report your own review.",
      });
    }
    if (review.isReported) {
      return res.status(409).json({
        success: false,
        message: "This review has already been reported.",
      });
    }

    review.isReported = true;
    review.reportReason = reason;
    await product.save();
    return res.status(200).json({
      success: true,
      message: "Review reported for admin review.",
    });
  } catch (error) {
    console.error("Report product review error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to report the review.",
    });
  }
};

module.exports = {
  getProductCategories,
  getProducts,
  getMyProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  reportProductReview,
};
