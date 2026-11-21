
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  isSmtpConfigured,
  sendPasswordResetEmail,
} = require("../services/emailService");

// Register a new customer
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Customer account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// Login an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Contact support.",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApplicationStatus: user.sellerApplicationStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// Get currently logged-in user
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      sellerApplicationStatus: req.user.sellerApplicationStatus,
    },
  });
};


const forgotPassword = async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetTokenHash +passwordResetTokenExpiresAt"
    );

    // Email does not exist in MongoDB
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email is not registered with ShopSphere.",
      });
    }

    // Check SMTP configuration
    if (!isSmtpConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Please try again later.",
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token in MongoDB
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetTokenHash = resetTokenHash;

    // Link expires after 30 minutes
    user.passwordResetTokenExpiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await user.save();

    const clientUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).replace(/\/+$/, "");

    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      return res.status(200).json({
        success: true,
        message: "Email verified! Password reset link sent successfully.",
      });
    } catch (emailError) {
      console.error(
        "Password reset email failed:",
        emailError.message
      );

      user.passwordResetTokenHash = null;
      user.passwordResetTokenExpiresAt = null;
      await user.save();

      return res.status(503).json({
        success: false,
        message: "Unable to send email. Please check email configuration.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request.",
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const resetToken =
      typeof req.params.token === "string" ? req.params.token : "";
    const newPassword = req.body.password;

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: resetTokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }).select(
      "+password +passwordResetTokenHash +passwordResetTokenExpiresAt"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
