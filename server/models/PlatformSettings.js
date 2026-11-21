const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "platform",
      unique: true,
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
      max: 10000,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
