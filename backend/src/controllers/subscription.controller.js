const SubscriptionPlan = require("../models/SubscriptionPlan.model");
const Company = require("../models/Company.model");
const Project = require("../models/project.model");
const Task = require("../models/Task.model");
const User = require("../models/User.model");
const modulesConfig = require("../config/modules");

// ✅ GET ALL PLANS
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).select(
      "planName billingCycle price modules",
    );

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE PLAN (SUPERADMIN ONLY LOGIC FROM FRONTEND)
exports.createPlan = async (req, res) => {
  try {
    const { planName, billingCycle, price, modules } = req.body;

    if (!planName || !billingCycle || price === undefined) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // 🔥 FIX: convert limit to number
    const validModules = modulesConfig.map((m) => m.name);

    const formattedModules = (modules || []).map((m) => {
      if (!validModules.includes(m.moduleName)) {
        throw new Error(`Invalid module: ${m.moduleName}`);
      }

      return {
        moduleName: m.moduleName,
        limit: Number(m.limit),
      };
    });

    const plan = await SubscriptionPlan.create({
      planName,
      billingCycle,
      price: Number(price),
      modules: formattedModules,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PLAN
exports.updatePlan = async (req, res) => {
  try {
    const { modules, price, ...rest } = req.body;

    const updateData = { ...rest };

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (modules) {
      updateData.modules = modules.map((m) => ({
        moduleName: m.moduleName,
        limit: Number(m.limit),
      }));
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 🔥 SYNC COMPANIES (OPTIMIZED)
    const companies = await Company.find({
      "subscription.planId": plan._id,
    });

    for (const company of companies) {
      if (!company.subscription) continue;

      // ✅ update modules
      company.subscription.modules = plan.modules.map((m) => ({
        moduleName: m.moduleName,
        limit: Number(m.limit),
      }));

      // ✅ OPTIONAL: reset validity (recommended)
      const startDate = new Date();
      let days = 30;

      if (plan.billingCycle === "Quarterly") days = 90;
      if (plan.billingCycle === "Half-Yearly") days = 180;
      if (plan.billingCycle === "Yearly") days = 365;

      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      company.subscription.startDate = startDate;
      company.subscription.endDate = endDate;

      await company.save();
    }

    res.json({
      message: "Plan updated & synced successfully",
      plan,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE PLAN
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ APPLY PLAN (OWNER)
exports.applyPlan = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID required" });
    }

    const companyId = req.user.company;

    // 🔍 Get Plan
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 📅 Calculate duration
    let days = 30;

    if (plan.billingCycle === "Quarterly") days = 90;
    if (plan.billingCycle === "Half-Yearly") days = 180;
    if (plan.billingCycle === "Yearly") days = 365;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    // 🔥 COPY ALL MODULES (IMPORTANT FIX)
    const modules = plan.modules.map((m) => ({
      moduleName: m.moduleName,
      limit: Number(m.limit),
    }));

    // 🔥 SAFE UPDATE (NO findByIdAndUpdate)
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.subscription = {
      planId: plan._id,
      modules, // ✅ all modules copied
      startDate,
      endDate,
      status: "active",
    };

    await company.save();

    res.json({
      message: "Plan activated successfully",
      subscription: company.subscription,
    });
  } catch (err) {
    console.error("Apply Plan Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET MY COMPANY
exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company).populate(
      "subscription.planId",
    );

    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ USAGE API
exports.getUsage = async (req, res) => {
  try {
    const companyId = req.user.company;

    const project = await Project.countDocuments({ company: companyId });
    const task = await Task.countDocuments({ company: companyId });
    const staff = await User.countDocuments({
      company: companyId,
      role: { $in: ["staff", "admin"] },
    });

    res.json({ project, task, staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET MODULES (FOR DROPDOWN)
exports.getModules = async (req, res) => {
  try {
    res.json(modulesConfig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
