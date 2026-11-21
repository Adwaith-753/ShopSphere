
const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema(
  {
    // Customer who submitted this application
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Individual or business seller
    sellerType: {
      type: String,
      enum: ["individual", "business"],
      required: true,
    },

    // Store information
    storeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    storeDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    storeCategory: {
      type: String,
      required: true,
      trim: true,
    },

    storeLogo: {
      type: String,
      default: "",
    },

    // Contact information
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    businessWebsite: {
      type: String,
      default: "",
      trim: true,
    },

    // Business address
    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    // Seller agreement
    acceptedSellerTerms: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Seller terms must be accepted.",
      },
    },

    // Application review
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SellerApplication = mongoose.model(
  "SellerApplication",
  sellerApplicationSchema
);

module.exports = SellerApplication;
