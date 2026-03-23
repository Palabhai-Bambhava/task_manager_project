const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    modules: [
      {
        type: String, 
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);