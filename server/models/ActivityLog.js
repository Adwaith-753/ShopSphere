const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    targetId: {
      type: String,
      default: "",
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
