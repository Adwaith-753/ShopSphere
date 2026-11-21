
const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const trendStart = new Date();
    trendStart.setUTCHours(0, 0, 0, 0);
    trendStart.setUTCDate(trendStart.getUTCDate() - 6);

    const [
      totalUsers,
      users,
      sellers,
      products,
      orders,
      pendingApplications,
      categories,
      revenueData,
      revenueTrendData,
      recentOrders,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "seller" }),
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Order.countDocuments(),
      SellerApplication.countDocuments({ status: "pending" }),
      Product.distinct("category", { isDeleted: { $ne: true } }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: trendStart },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find()
        .select("_id user status total createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("user", "name"),
      SellerApplication.find()
        .select("_id user storeName status createdAt reviewedAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(6)
        .populate("user", "name"),
    ]);

    const revenueByDate = new Map(
      revenueTrendData.map(({ _id, revenue }) => [_id, revenue])
    );
    const salesTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(trendStart);
      date.setUTCDate(date.getUTCDate() + index);
      const dateKey = date.toISOString().slice(0, 10);

      return {
        date: dateKey,
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
          timeZone: "UTC",
        }),
        revenue: revenueByDate.get(dateKey) || 0,
      };
    });

    const recentActivity = [
      ...recentOrders.map((order) => ({
        id: `order-${order._id}`,
        type: "order",
        title: "New order received",
        detail: `Order #${order._id.toString().slice(-6).toUpperCase()} - ${
          order.user?.name || "Customer"
        }`,
        status: order.status,
        createdAt: order.createdAt,
      })),
      ...recentApplications.map((application) => ({
        id: `application-${application._id}`,
        type: "application",
        title: `Seller application ${application.status}`,
        detail: `${application.storeName} - ${
          application.user?.name || "Applicant"
        }`,
        status: application.status,
        createdAt:
          application.status === "pending"
            ? application.createdAt
            : application.reviewedAt || application.updatedAt,
      })),
    ]
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      )
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        users,
        sellers,
        products,
        categories: categories.length,
        orders,
        pendingApplications,
        revenue: revenueData[0]?.revenue || 0,
        salesTrend,
        recentOrders,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
};

// GET ALL SELLER APPLICATIONS
const getSellerApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find()
      .populate("user", "name email role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get seller applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller applications.",
    });
  }
};

// GET ONE SELLER APPLICATION
const getSellerApplicationById = async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id)
      .populate("user", "name email role")
      .populate("reviewedBy", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get seller application details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch application details.",
    });
  }
};

// APPROVE SELLER APPLICATION
const approveSellerApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be approved.",
      });
    }

    const user = await User.findById(application.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Applicant account not found.",
      });
    }

    if (user.role !== "customer" ||
        user.sellerApplicationStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Applicant account is not eligible for approval.",
      });
    }

    // Update applicant's role
    user.role = "seller";
    user.sellerApplicationStatus = "approved";

    await user.save();

    // Update application review details
    application.status = "approved";
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.rejectionReason = "";

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Seller application approved successfully.",
      application,
    });
  } catch (error) {
    console.error("Approve seller application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve seller application.",
    });
  }
};

// REJECT SELLER APPLICATION
const rejectSellerApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason.",
      });
    }

    if (rejectionReason.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason cannot exceed 1000 characters.",
      });
    }

    const application = await SellerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be rejected.",
      });
    }

    const user = await User.findById(application.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Applicant account not found.",
      });
    }

    if (user.role !== "customer" ||
        user.sellerApplicationStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Applicant account is not eligible for rejection.",
      });
    }

    // Update application review details
    application.status = "rejected";
    application.rejectionReason = rejectionReason.trim();
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    // Keep applicant as customer so they can reapply
    user.sellerApplicationStatus = "rejected";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Seller application rejected successfully.",
      application,
    });
  } catch (error) {
    console.error("Reject seller application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject seller application.",
    });
  }
};

module.exports = {
  getDashboardStats,
  getSellerApplications,
  getSellerApplicationById,
  approveSellerApplication,
  rejectSellerApplication,
};
