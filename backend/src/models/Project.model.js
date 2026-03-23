const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference Staff model
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
