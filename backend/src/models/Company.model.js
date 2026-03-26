const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    website: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
      },
      modules: [
        {
          moduleName: {
            type: String,
            required: true,
          },
          limit: {
            type: Number,
            required: true,
          },
        },
      ],
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["active", "expired"],
        default: "active",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
