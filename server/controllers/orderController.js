const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const findValidCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });
  if (!coupon) return { error: "That coupon is not active." };

  const now = new Date();
  if (
    coupon.startsAt > now ||
    (coupon.expiresAt && coupon.expiresAt <= now) ||
    (coupon.maxUses !== null &&
      coupon.maxUses !== undefined &&
      coupon.usedCount >= coupon.maxUses)
  ) {
    return { error: "That coupon has expired or reached its usage limit." };
  }
  if (subtotal < coupon.minimumOrder) {
    return {
      error: `This coupon requires a minimum order of Rs. ${coupon.minimumOrder}.`,
    };
  }

  const rawDiscount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  return {
    coupon,
    discount: Math.min(subtotal, Number(rawDiscount.toFixed(2))),
  };
};

const validateCoupon = async (req, res) => {
  try {
    const code = typeof req.body.code === "string" ? req.body.code : "";
    const subtotal = Number(req.body.subtotal);
    if (!code.trim() || !Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a coupon code and valid cart subtotal.",
      });
    }

    const result = await findValidCoupon(code, subtotal);
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      code: result.coupon.code,
      discount: result.discount,
      total: Math.max(0, subtotal - result.discount),
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to validate coupon.",
    });
  }
};

const createOrder = async (req, res) => {
  let reservedCouponId = null;
  const reservedProducts = [];
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "cod",
      couponCode = "",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    if (
      !shippingAddress ||
      requiredAddressFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address.",
      });
    }

    if (paymentMethod !== "cod") {
      return res.status(400).json({
        success: false,
        message: "Only cash on delivery is currently supported.",
      });
    }

    const productIds = items.map((item) => item.productId);

    if (
      productIds.some(
        (productId) => !mongoose.isValidObjectId(productId)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "The cart contains an invalid product.",
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isDeleted: { $ne: true },
      $or: [{ status: "active" }, { status: { $exists: false } }],
    });

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products are no longer available.",
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Product quantities must be whole numbers.",
        });
      }

      if (product.stock < quantity) {
        return res.status(409).json({
          success: false,
          message: `${product.name} has only ${product.stock} item(s) available.`,
        });
      }

      subtotal += product.price * quantity;
      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    let coupon;
    let discountTotal = 0;
    if (couponCode) {
      const couponResult = await findValidCoupon(couponCode, subtotal);
      if (couponResult.error) {
        return res.status(400).json({
          success: false,
          message: couponResult.error,
        });
      }
      coupon = couponResult.coupon;
      discountTotal = couponResult.discount;
    }

    if (coupon) {
      const now = new Date();
      const couponFilter = {
        _id: coupon._id,
        isActive: true,
        startsAt: { $lte: now },
        $and: [
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: now } },
            ],
          },
        ],
      };
      if (coupon.maxUses !== null && coupon.maxUses !== undefined) {
        couponFilter.usedCount = { $lt: coupon.maxUses };
      }
      const reservedCoupon = await Coupon.findOneAndUpdate(
        couponFilter,
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      if (!reservedCoupon) {
        return res.status(409).json({
          success: false,
          message: "That coupon is no longer available.",
        });
      }
      reservedCouponId = coupon._id;
    }

    for (const item of orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          isDeleted: { $ne: true },
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        const error = new Error(
          "Product inventory changed while placing your order."
        );
        error.status = 409;
        throw error;
      }
      reservedProducts.push(item);
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      couponCode: coupon?.code || "",
      discountTotal,
      shippingFee: 0,
      total: subtotal - discountTotal,
    });
    reservedCouponId = null;
    reservedProducts.length = 0;

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    try {
      await Promise.all([
        ...reservedProducts.map((item) =>
          Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } }
          )
        ),
        ...(reservedCouponId
          ? [
              Coupon.updateOne(
                { _id: reservedCouponId, usedCount: { $gt: 0 } },
                { $inc: { usedCount: -1 } }
              ),
            ]
          : []),
      ]);
    } catch (rollbackError) {
      console.error("Order reservation rollback failed:", rollbackError);
    }
    console.error("Create order error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Unable to place your order.",
    });
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
};

const getMyOrderById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  return res.status(200).json({ success: true, order });
};

const cancelMyOrder = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  if (!["placed", "confirmed"].includes(order.status)) {
    return res.status(409).json({
      success: false,
      message: "This order can no longer be cancelled.",
    });
  }

  order.status = "cancelled";
  await order.save();

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity } }
    );
  }
  if (order.couponCode) {
    await Coupon.updateOne(
      { code: order.couponCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    order,
  });
};

const getSellerOrders = async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
};

const updateOrderStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID.",
    });
  }

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
      message: "Invalid order status.",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  order.status = req.body.status;
  await order.save();

  return res.status(200).json({
    success: true,
    order,
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
};
