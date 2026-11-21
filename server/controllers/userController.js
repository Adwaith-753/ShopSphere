
const User = require("../models/User");
const SellerApplication = require("../models/SellerApplication");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// @desc Update logged-in user's profile
// @route PUT /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Name and email cannot be empty.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered.",
      });
    }

    user.name = trimmedName;
    user.email = normalizedEmail;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApplicationStatus: user.sellerApplicationStatus,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};


// @desc Verify logged-in user's current password
// @route POST /api/users/verify-password
// @access Private
const verifyCurrentPassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter your current password.",
      });
    }

    const user = await User.findById(req.user._id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect current password. Please try again or use Forgot Password on the login page.",
      });
    }

    // Generate a random one-time token ID
    const tokenId = crypto.randomBytes(32).toString("hex");

    // Create temporary password-change authorization
    const passwordChangeToken = jwt.sign(
      {
        id: user._id.toString(),
        purpose: "password-change",
        jti: tokenId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      }
    );

    // Hash the token before storing it
    const tokenHash = crypto
      .createHash("sha256")
      .update(passwordChangeToken)
      .digest("hex");

    // Store only the token hash and expiry
    user.passwordChangeTokenHash = tokenHash;
    user.passwordChangeTokenExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Current password verified successfully.",
      passwordChangeToken,
    });
  } catch (error) {
    console.error("Password verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify current password.",
    });
  }
};


// @desc Change password after current password verification
// @route PUT /api/users/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const passwordChangeToken =
      req.headers["x-password-change-token"];

    if (!passwordChangeToken) {
      return res.status(401).json({
        success: false,
        message: "Password verification is required.",
      });
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters.",
      });
    }

    // Verify temporary authorization token
    let decoded;

    try {
      decoded = jwt.verify(
        passwordChangeToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          "Password verification expired. Please verify your current password again.",
      });
    }

    // Ensure token belongs to this logged-in user
    if (
      decoded.id !== req.user._id.toString() ||
      decoded.purpose !== "password-change" ||
      !decoded.jti
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid password change authorization.",
      });
    }

    // Load password and hidden verification fields
    const user = await User.findById(req.user._id).select(
      "+password +passwordChangeTokenHash +passwordChangeTokenExpiresAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check whether verification exists and has not expired
    if (
      !user.passwordChangeTokenHash ||
      !user.passwordChangeTokenExpiresAt ||
      user.passwordChangeTokenExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Password verification expired or already used. Please verify again.",
      });
    }

    // Hash the supplied token
    const suppliedTokenHash = crypto
      .createHash("sha256")
      .update(passwordChangeToken)
      .digest("hex");

    // Compare the supplied token hash with the stored hash
    const storedHash = Buffer.from(
      user.passwordChangeTokenHash,
      "hex"
    );

    const suppliedHash = Buffer.from(
      suppliedTokenHash,
      "hex"
    );

    if (
      storedHash.length !== suppliedHash.length ||
      !crypto.timingSafeEqual(storedHash, suppliedHash)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or already used password authorization.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    // Consume authorization so it cannot be reused
    user.passwordChangeTokenHash = null;
    user.passwordChangeTokenExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Password change error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};



// @desc Submit a seller application
// @route POST /api/users/seller-application
// @access Private
const submitSellerApplication = async (req, res) => {
  try {
    const {
      sellerType,
      storeName,
      storeDescription,
      storeCategory,
      storeLogo,
      contactPhone,
      contactEmail,
      businessWebsite,
      address,
      city,
      state,
      postalCode,
      country,
      acceptedSellerTerms,
    } = req.body;

    // Only customers can apply
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can apply to become sellers.",
      });
    }

    // Check required fields
    const requiredFields = [
      sellerType,
      storeName,
      storeDescription,
      storeCategory,
      contactPhone,
      contactEmail,
      address,
      city,
      state,
      postalCode,
      country,
    ];

    if (
      requiredFields.some(
        (field) => typeof field !== "string" || !field.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required application fields.",
      });
    }

    if (!["individual", "business"].includes(sellerType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid seller type.",
      });
    }

    if (acceptedSellerTerms !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept the seller terms.",
      });
    }

    if (storeName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Store name cannot exceed 100 characters.",
      });
    }

    if (storeDescription.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Store description cannot exceed 1000 characters.",
      });
    }

    const normalizedEmail = contactEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid contact email.",
      });
    }

    // Check the customer's existing application
    const existingApplication = await SellerApplication.findOne({
      user: req.user._id,
    });

    if (existingApplication?.status === "pending") {
      return res.status(409).json({
        success: false,
        message: "Your seller application is already under review.",
      });
    }

    if (existingApplication?.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "Your seller application has already been approved.",
      });
    }

    const applicationData = {
      sellerType,
      storeName: storeName.trim(),
      storeDescription: storeDescription.trim(),
      storeCategory: storeCategory.trim(),
      storeLogo: typeof storeLogo === "string" ? storeLogo.trim() : "",
      contactPhone: contactPhone.trim(),
      contactEmail: normalizedEmail,
      businessWebsite:
        typeof businessWebsite === "string"
          ? businessWebsite.trim()
          : "",
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      acceptedSellerTerms: true,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: "",
    };

    let application;

    if (existingApplication) {
      // Allow a rejected applicant to correct and resubmit
      Object.assign(existingApplication, applicationData);
      application = await existingApplication.save();
    } else {
      application = await SellerApplication.create({
        user: req.user._id,
        ...applicationData,
      });
    }

    // Keep the customer's application status in sync
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.sellerApplicationStatus = "pending";
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully.",
      application: {
        id: application._id,
        sellerType: application.sellerType,
        storeName: application.storeName,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Seller application submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit seller application.",
    });
  }
};


// @desc Get logged-in customer's seller application
// @route GET /api/users/seller-application
// @access Private
const getMySellerApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findOne({
      user: req.user._id,
    }).select("-__v");

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Seller application fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller application.",
    });
  }
};


// Export controller functions
module.exports = {
  updateProfile,
  verifyCurrentPassword,
  changePassword,
  submitSellerApplication,
  getMySellerApplication,
};
