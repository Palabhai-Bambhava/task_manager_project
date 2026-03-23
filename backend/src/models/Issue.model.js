const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// ✅ ADD INDEXES FOR LARGE DATASETS
issueSchema.index({ project: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Issue", issueSchema);
