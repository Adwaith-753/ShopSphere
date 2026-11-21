const crypto = require("crypto");
const ActivityLog = require("../models/ActivityLog");
const Category = require("../models/Category");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const PlatformSettings = require("../models/PlatformSettings");
const Product = require("../models/Product");
const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");

const defaultCategories = [
  "Electronics",
  "Fashion",
  "Accessories",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Books",
];

const recordActivity = (req, action, targetType, targetId, details) =>
  ActivityLog.create({
    actor: req.user._id,
    action,
    targetType,
    targetId: String(targetId || ""),
    details,
  });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ensureDefaultCategories = async () => {
  await Category.bulkWrite(
    defaultCategories.map((name) => ({
      updateOne: {
        filter: { name },
        update: { $setOnInsert: { name, isActive: true } },
        upsert: true,
      },
    }))
  );
};

const getAdminProducts = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      category,
      sort = "newest",
    } = req.query;
    const filter = {};

    if (status === "deleted") {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
      if (["active", "inactive"].includes(status)) {
        filter.status = status;
      }
    }

    if (category) filter.category = category;
    if (search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { name: expression },
        { category: expression },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      stock: { stock: 1 },
      name: { name: 1 },
    };

    const products = await Product.find(filter)
      .select("-reviews")
      .populate("seller", "name email")
      .sort(sortOptions[sort] || sortOptions.newest)
      .limit(250);

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get admin products error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
};

const createAdminProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock = 0, images = [] } =
      req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required.",
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number.",
      });
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number.",
      });
    }
    if (!Array.isArray(images) || images.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Provide up to 10 product images.",
      });
    }
    if (
      images.some(
        (image) =>
          !image ||
          typeof image.url !== "string" ||
          !image.url.trim() ||
          !validHttpUrl(image.url)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Product image URLs must use HTTP or HTTPS.",
      });
    }

    await ensureDefaultCategories();
    const categoryExists = await Category.exists({
      name: category.trim(),
      isActive: true,
    });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Select an active category.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      stock: parsedStock,
      images,
      seller: null,
      status: "active",
    });
    await recordActivity(
      req,
      "product.created",
      "product",
      product._id,
      `Created product "${product.name}".`
    );

    return res.status(201).json({
      success: true,
      message: "Product created.",
      product,
    });
  } catch (error) {
    console.error("Create admin product error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};

const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (
      req.body.images !== undefined &&
      (!Array.isArray(req.body.images) ||
        req.body.images.length > 10 ||
        req.body.images.some(
          (image) =>
            !image ||
            typeof image.url !== "string" ||
            !image.url.trim() ||
            !validHttpUrl(image.url)
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide up to 10 valid HTTP or HTTPS product image URLs.",
      });
    }

    const editableFields = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "images",
      "status",
      "isFeatured",
      "isTrending",
    ];
    for (const field of editableFields) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }
    if (product.category) {
      await ensureDefaultCategories();
      const categoryExists = await Category.exists({
        name: product.category,
        isActive: true,
      });
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Select an active category.",
        });
      }
    }

    await product.save();
    await recordActivity(
      req,
      "product.updated",
      "product",
      product._id,
      `Updated product "${product.name}".`
    );
    return res.status(200).json({
      success: true,
      message: "Product updated.",
      product,
    });
  } catch (error) {
    console.error("Update admin product error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update product.",
    });
  }
};

const softDeleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    if (product.isDeleted) {
      return res.status(409).json({
        success: false,
        message: "Product is already in the recycle bin.",
      });
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();
    await recordActivity(
      req,
      "product.archived",
      "product",
      product._id,
      `Moved product "${product.name}" to the recycle bin.`
    );
    return res.status(200).json({
      success: true,
      message: "Product moved to the recycle bin.",
    });
  } catch (error) {
    console.error("Archive admin product error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to archive product.",
    });
  }
};

const restoreAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Deleted product not found.",
      });
    }
    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();
    await recordActivity(
      req,
      "product.restored",
      "product",
      product._id,
      `Restored product "${product.name}".`
    );
    return res.status(200).json({
      success: true,
      message: "Product restored.",
      product,
    });
  } catch (error) {
    console.error("Restore admin product error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to restore product.",
    });
  }
};

const getAdminCategories = async (req, res) => {
  try {
    await ensureDefaultCategories();
    const [categories, counts] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Product.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);
    const productCounts = new Map(
      counts.map(({ _id, count }) => [_id, count])
    );
    return res.status(200).json({
      success: true,
      categories: categories.map((category) => ({
        ...category.toObject(),
        productCount: productCounts.get(category.name) || 0,
      })),
    });
  } catch (error) {
    console.error("Get admin categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load categories.",
    });
  }
};

const createAdminCategory = async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";
    const imageUrl =
      typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";
    if (name.length < 2 || name.length > 60 || !validHttpUrl(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: "Enter a category name and a valid image URL.",
      });
    }
    const category = await Category.create({ name, imageUrl });
    await recordActivity(
      req,
      "category.created",
      "category",
      category._id,
      `Created category "${category.name}".`
    );
    return res.status(201).json({
      success: true,
      message: "Category created.",
      category,
    });
  } catch (error) {
    console.error("Create admin category error:", error);
    return res.status(409).json({
      success: false,
      message: "Unable to create category. The name may already exist.",
    });
  }
};

const updateAdminCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const nextName =
      typeof req.body.name === "string" ? req.body.name.trim() : category.name;
    const imageUrl =
      typeof req.body.imageUrl === "string"
        ? req.body.imageUrl.trim()
        : category.imageUrl;
    if (
      nextName.length < 2 ||
      nextName.length > 60 ||
      !validHttpUrl(imageUrl)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid category name and image URL.",
      });
    }

    const previousName = category.name;
    if (previousName !== nextName) {
      const duplicate = await Category.exists({
        name: nextName,
        _id: { $ne: category._id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A category with that name already exists.",
        });
      }
      await Product.updateMany(
        { category: previousName },
        { $set: { category: nextName } }
      );
    }

    category.name = nextName;
    category.imageUrl = imageUrl;
    if (typeof req.body.isActive === "boolean") {
      category.isActive = req.body.isActive;
    }
    if (typeof req.body.isDeleted === "boolean") {
      category.isDeleted = req.body.isDeleted;
      if (category.isDeleted) category.isActive = false;
    }
    try {
      await category.save();
    } catch (error) {
      if (previousName !== nextName) {
        await Product.updateMany(
          { category: nextName },
          { $set: { category: previousName } }
        );
      }
      throw error;
    }
    await recordActivity(
      req,
      "category.updated",
      "category",
      category._id,
      `Updated category "${category.name}".`
    );
    return res.status(200).json({
      success: true,
      message: "Category updated.",
      category,
    });
  } catch (error) {
    console.error("Update admin category error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update category.",
    });
  }
};

const deleteAdminCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    const products = await Product.countDocuments({
      category: category.name,
    });
    if (products) {
      return res.status(409).json({
        success: false,
        message: "Move or delete this category's products before deleting it.",
      });
    }
    category.isDeleted = true;
    category.isActive = false;
    await category.save();
    await recordActivity(
      req,
      "category.deleted",
      "category",
      category._id,
      `Deleted category "${category.name}".`
    );
    return res.status(200).json({
      success: true,
      message: "Category moved to the recycle bin.",
    });
  } catch (error) {
    console.error("Delete admin category error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete category.",
    });
  }
};

const getAdminInventory = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: "platform" });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;
    const filter = { isDeleted: { $ne: true } };
    if (req.query.lowStock === "true") {
      filter.stock = { $lte: lowStockThreshold };
    }
    const products = await Product.find(filter)
      .select("name category stock status seller")
      .populate("seller", "name")
      .sort({ stock: 1, name: 1 })
      .limit(300);
    return res.status(200).json({
      success: true,
      lowStockThreshold,
      products,
    });
  } catch (error) {
    console.error("Get admin inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load inventory.",
    });
  }
};

const updateAdminInventory = async (req, res) => {
  try {
    const stock = Number(req.body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number.",
      });
    }
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    const previousStock = product.stock;
    product.stock = stock;
    await product.save();
    await recordActivity(
      req,
      "inventory.adjusted",
      "product",
      product._id,
      `Changed ${product.name} stock from ${previousStock} to ${stock}.`
    );
    return res.status(200).json({
      success: true,
      message: "Inventory updated.",
      product,
    });
  } catch (error) {
    console.error("Update admin inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update inventory.",
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const filter = {};
    if (
      ["placed", "confirmed", "shipped", "delivered", "cancelled"].includes(
        req.query.status
      )
    ) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter)
      .select("_id user items total paymentMethod paymentStatus status createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(300);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load orders.",
    });
  }
};

const updateAdminOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid order status.",
      });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
    const previousStatus = order.status;
    if (previousStatus === "cancelled" && req.body.status !== "cancelled") {
      return res.status(409).json({
        success: false,
        message: "Cancelled orders cannot be reopened.",
      });
    }
    order.status = req.body.status;
    await order.save();
    if (previousStatus !== "cancelled" && order.status === "cancelled") {
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } }
          )
        )
      );
      if (order.couponCode) {
        await Coupon.updateOne(
          { code: order.couponCode, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } }
        );
      }
    }
    await recordActivity(
      req,
      "order.status_changed",
      "order",
      order._id,
      `Changed order ${order._id} from ${previousStatus} to ${order.status}.`
    );
    return res.status(200).json({
      success: true,
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    console.error("Update admin order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const filter = { role: { $in: ["customer", "seller"] } };
    if (["customer", "seller"].includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.status === "active") filter.isActive = { $ne: false };
    if (req.query.status === "suspended") filter.isActive = false;
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const expression = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ name: expression }, { email: expression }];
    }
    const users = await User.find(filter)
      .select("name email role isActive sellerApplicationStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(300);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load marketplace users.",
    });
  }
};

const getAdminUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email role isActive sellerApplicationStatus createdAt")
      .lean();
    if (!user || !["customer", "seller"].includes(user.role)) {
      return res.status(404).json({
        success: false,
        message: "Marketplace account not found.",
      });
    }

    const [orders, application, products] = await Promise.all([
      Order.find(
        user.role === "seller"
          ? { "items.seller": user._id }
          : { user: user._id }
      )
        .select("_id total status paymentStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(30),
      user.role === "seller"
        ? SellerApplication.findOne({ user: user._id }).select(
            "storeName storeDescription storeCategory storeLogo status"
          )
        : Promise.resolve(null),
      user.role === "seller"
        ? Product.find({ seller: user._id, isDeleted: { $ne: true } })
            .select("name stock status price")
            .limit(50)
        : Promise.resolve([]),
    ]);

    return res.status(200).json({
      success: true,
      user,
      orders,
      application,
      products,
    });
  } catch (error) {
    console.error("Get admin user details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load account details.",
    });
  }
};

const setAdminUserStatus = async (req, res) => {
  try {
    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Choose whether this account is active.",
      });
    }
    const user = await User.findById(req.params.id);
    if (!user || !["customer", "seller"].includes(user.role)) {
      return res.status(404).json({
        success: false,
        message: "Customer or seller account not found.",
      });
    }
    const previousStatus = user.isActive !== false;
    user.isActive = req.body.isActive;
    await user.save();
    await recordActivity(
      req,
      "user.status_changed",
      "user",
      user._id,
      `${user.role} account ${user.email} ${
        user.isActive ? "reactivated" : "suspended"
      }.`
    );
    return res.status(200).json({
      success: true,
      message: user.isActive
        ? "Account reactivated."
        : "Account suspended.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        previousStatus,
      },
    });
  } catch (error) {
    console.error("Set admin user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update account status.",
    });
  }
};

const getAdminReviews = async (req, res) => {
  try {
    const filter = {
      "reviews.0": { $exists: true },
      isDeleted: { $ne: true },
    };
    if (req.query.reported === "true") {
      filter["reviews.isReported"] = true;
    }
    const products = await Product.find(filter)
      .select("name reviews")
      .populate("reviews.user", "name email")
      .sort({ updatedAt: -1 })
      .limit(300);
    const reviews = products.flatMap((product) =>
      product.reviews.map((review) => ({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        user: review.user,
        rating: review.rating,
        comment: review.comment,
        isReported: review.isReported,
        reportReason: review.reportReason,
        createdAt: review.createdAt,
      }))
    );
    reviews.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    );
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load product reviews.",
    });
  }
};

const deleteAdminReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }
    const reviewText = review.comment.slice(0, 100);
    review.deleteOne();
    await product.save();
    await recordActivity(
      req,
      "review.removed",
      "product",
      product._id,
      `Removed a review from "${product.name}": ${reviewText}`
    );
    return res.status(200).json({
      success: true,
      message: "Review removed.",
    });
  } catch (error) {
    console.error("Delete admin review error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to remove review.",
    });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const orders = await Order.find({ paymentMethod: "cod" })
      .select("_id user total paymentStatus status createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(300);
    const totals = await Order.aggregate([
      { $match: { paymentMethod: "cod" } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          amount: { $sum: "$total" },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      paymentMode: "Cash on Delivery",
      orders,
      totals,
    });
  } catch (error) {
    console.error("Get admin payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load COD payment records.",
    });
  }
};

const updateAdminPaymentStatus = async (req, res) => {
  try {
    if (!["pending", "paid", "refunded"].includes(req.body.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid COD payment status.",
      });
    }
    const order = await Order.findOne({
      _id: req.params.id,
      paymentMethod: "cod",
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "COD order not found.",
      });
    }
    const previousStatus = order.paymentStatus;
    order.paymentStatus = req.body.paymentStatus;
    await order.save();
    await recordActivity(
      req,
      "payment.status_changed",
      "order",
      order._id,
      `Changed COD order ${order._id} payment from ${previousStatus} to ${order.paymentStatus}.`
    );
    return res.status(200).json({
      success: true,
      message: "COD payment status updated.",
      order,
    });
  } catch (error) {
    console.error("Update admin payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update COD payment status.",
    });
  }
};

const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Get admin coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load coupons.",
    });
  }
};

const saveAdminCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrder = 0,
      startsAt,
      expiresAt,
      maxUses,
      isActive = true,
    } = req.body;
    const normalizedCode =
      typeof code === "string" ? code.trim().toUpperCase() : "";
    const value = Number(discountValue);
    const minimum = Number(minimumOrder);
    const uses = maxUses === "" || maxUses == null ? null : Number(maxUses);
    if (
      normalizedCode.length < 3 ||
      normalizedCode.length > 30 ||
      !["percentage", "fixed"].includes(discountType) ||
      !Number.isFinite(value) ||
      value <= 0 ||
      (discountType === "percentage" && value > 100) ||
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      (uses !== null && (!Number.isInteger(uses) || uses < 1))
    ) {
      return res.status(400).json({
        success: false,
        message: "Check the coupon code, discount, minimum, and usage limit.",
      });
    }
    const values = {
      code: normalizedCode,
      discountType,
      discountValue: value,
      minimumOrder: minimum,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUses: uses,
      isActive: Boolean(isActive),
    };
    if (
      Number.isNaN(values.startsAt.getTime()) ||
      (values.expiresAt && Number.isNaN(values.expiresAt.getTime())) ||
      (values.expiresAt && values.expiresAt <= values.startsAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon dates are invalid.",
      });
    }

    let coupon;
    if (req.params.id) {
      coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found.",
        });
      }
      Object.assign(coupon, values);
      await coupon.save();
    } else {
      coupon = await Coupon.create(values);
    }
    await recordActivity(
      req,
      req.params.id ? "coupon.updated" : "coupon.created",
      "coupon",
      coupon._id,
      `${req.params.id ? "Updated" : "Created"} coupon ${coupon.code}.`
    );
    return res.status(req.params.id ? 200 : 201).json({
      success: true,
      message: `Coupon ${req.params.id ? "updated" : "created"}.`,
      coupon,
    });
  } catch (error) {
    console.error("Save admin coupon error:", error);
    return res.status(409).json({
      success: false,
      message: "Unable to save coupon. The code may already exist.",
    });
  }
};

const deleteAdminCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }
    coupon.isActive = false;
    await coupon.save();
    await recordActivity(
      req,
      "coupon.deactivated",
      "coupon",
      coupon._id,
      `Deactivated coupon ${coupon.code}.`
    );
    return res.status(200).json({
      success: true,
      message: "Coupon deactivated.",
    });
  } catch (error) {
    console.error("Deactivate admin coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to deactivate coupon.",
    });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 29);
    const [sales, topProducts, topSellers, inventory, sellerRatings] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              status: { $ne: "cancelled" },
              createdAt: { $gte: start },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              orders: { $sum: 1 },
              revenue: { $sum: "$total" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              name: { $first: "$items.name" },
              quantity: { $sum: "$items.quantity" },
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
          { $sort: { quantity: -1 } },
          { $limit: 10 },
        ]),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $unwind: "$items" },
          { $match: { "items.seller": { $ne: null } } },
          {
            $group: {
              _id: "$items.seller",
              orders: { $addToSet: "$_id" },
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "seller",
            },
          },
          {
            $project: {
              name: { $arrayElemAt: ["$seller.name", 0] },
              orders: { $size: "$orders" },
              revenue: 1,
            },
          },
        ]),
        Product.find({ isDeleted: { $ne: true } })
          .select("name stock category")
          .sort({ stock: 1 })
          .limit(10),
        Product.aggregate([
          {
            $match: {
              seller: { $ne: null },
              isDeleted: { $ne: true },
            },
          },
          { $unwind: "$reviews" },
          {
            $group: {
              _id: "$seller",
              rating: { $avg: "$reviews.rating" },
              reviewCount: { $sum: 1 },
            },
          },
        ]),
      ]);

    const sellerRatingById = new Map(
      sellerRatings.map((item) => [String(item._id), item])
    );
    const sellersWithRatings = topSellers.map((seller) => ({
      ...seller,
      rating: sellerRatingById.get(String(seller._id))?.rating ?? null,
      reviewCount:
        sellerRatingById.get(String(seller._id))?.reviewCount ?? 0,
    }));

    return res.status(200).json({
      success: true,
      analytics: {
        sales,
        topProducts,
        topSellers: sellersWithRatings,
        lowStockProducts: inventory,
      },
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate analytics.",
    });
  }
};

const getAdminSettings = async (req, res) => {
  try {
    const [settings, admin] = await Promise.all([
      PlatformSettings.findOneAndUpdate(
        { key: "platform" },
        { $setOnInsert: { key: "platform" } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ),
      User.findById(req.user._id).select("name email"),
    ]);
    return res.status(200).json({
      success: true,
      settings,
      admin,
      integrations: {
        cloudinary: Boolean(
          process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        ),
        openai: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  } catch (error) {
    console.error("Get admin settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load admin settings.",
    });
  }
};

const updateAdminSettings = async (req, res) => {
  try {
    const { name, email, commissionRate, lowStockThreshold } = req.body;
    const parsedCommission = Number(commissionRate);
    const parsedThreshold = Number(lowStockThreshold);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (
      !trimmedName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      !Number.isFinite(parsedCommission) ||
      parsedCommission < 0 ||
      parsedCommission > 100 ||
      !Number.isInteger(parsedThreshold) ||
      parsedThreshold < 0 ||
      parsedThreshold > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Check the admin profile, commission, and stock threshold.",
      });
    }
    const duplicateEmail = await User.exists({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });
    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message: "That email address is already in use.",
      });
    }
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }
    admin.name = trimmedName;
    admin.email = normalizedEmail;
    await admin.save();

    const settings = await PlatformSettings.findOneAndUpdate(
      { key: "platform" },
      {
        $set: {
          commissionRate: parsedCommission,
          lowStockThreshold: parsedThreshold,
          updatedBy: admin._id,
        },
        $setOnInsert: { key: "platform" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await recordActivity(
      req,
      "settings.updated",
      "platform",
      settings._id,
      "Updated admin profile and platform settings."
    );
    return res.status(200).json({
      success: true,
      message: "Admin and platform settings updated.",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      settings,
    });
  } catch (error) {
    console.error("Update admin settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update admin settings.",
    });
  }
};

const getAdminActivity = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: "platform" });
    const [activity, lowStockProducts, pendingApplications] = await Promise.all([
      ActivityLog.find()
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .limit(100),
      Product.find({
        isDeleted: { $ne: true },
        stock: { $lte: settings?.lowStockThreshold ?? 5 },
      })
        .select("name stock")
        .sort({ stock: 1 })
        .limit(30),
      SellerApplication.countDocuments({ status: "pending" }),
    ]);
    return res.status(200).json({
      success: true,
      activity,
      notifications: [
        ...lowStockProducts.map((product) => ({
          id: `low-stock-${product._id}`,
          type: "low-stock",
          message: `${product.name} has only ${product.stock} item(s) left.`,
        })),
        ...(pendingApplications
          ? [
              {
                id: "pending-applications",
                type: "seller-applications",
                message: `${pendingApplications} seller application(s) need review.`,
              },
            ]
          : []),
      ],
    });
  } catch (error) {
    console.error("Get admin activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load admin activity.",
    });
  }
};

const getCloudinarySignature = async (req, res) => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (
    !CLOUDINARY_CLOUD_NAME ||
    !CLOUDINARY_API_KEY ||
    !CLOUDINARY_API_SECRET
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.",
    });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = `folder=shopsphere/products&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${parameters}${CLOUDINARY_API_SECRET}`)
    .digest("hex");
  return res.status(200).json({
    success: true,
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder: "shopsphere/products",
  });
};

const askOpenAi = async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      message: "OpenAI is not configured. Set OPENAI_API_KEY in server/.env.",
    });
  }
  const question =
    typeof req.body.question === "string" ? req.body.question.trim() : "";
  if (!question || question.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Enter a question up to 2,000 characters.",
    });
  }
  try {
    const [userCount, productCount, orderCount, revenue, lowStock] =
      await Promise.all([
        User.countDocuments({ role: { $in: ["customer", "seller"] } }),
        Product.countDocuments({ isDeleted: { $ne: true } }),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Product.countDocuments({
          isDeleted: { $ne: true },
          stock: { $lte: 5 },
        }),
      ]);
    const context = {
      users: userCount,
      products: productCount,
      orders: orderCount,
      grossSales: revenue[0]?.total || 0,
      lowStockProducts: lowStock,
    };
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are ShopSphere's concise marketplace operations assistant. Use only the supplied metrics; state uncertainty and do not invent facts.",
          },
          {
            role: "user",
            content: `Marketplace metrics: ${JSON.stringify(context)}\n\nAdmin request: ${question}`,
          },
        ],
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      console.error("OpenAI request failed with status:", response.status);
      return res.status(502).json({
        success: false,
        message: "OpenAI request failed. Check the API key and model settings.",
      });
    }
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({
        success: false,
        message: "OpenAI returned an empty response.",
      });
    }
    return res.status(200).json({ success: true, answer: answer.trim() });
  } catch (error) {
    console.error("OpenAI assistant error:", error);
    return res.status(502).json({
      success: false,
      message: "Unable to contact OpenAI. Please try again.",
    });
  }
};

module.exports = {
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
};
