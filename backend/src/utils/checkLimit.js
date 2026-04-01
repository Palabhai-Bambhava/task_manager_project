const mongoose = require("mongoose");

const Company = require("../models/Company.model");
const Project = require("../models/project.model");
const Task = require("../models/Task.model");
const User = require("../models/User.model");
const Issue = require("../models/Issue.model");
const Document = require("../models/Document.model");

const modelMap = {
  project: Project,
  task: Task,
  staff: User,
  issue: Issue,
  document: Document,
};

const checkLimit = async (companyId, moduleName) => {
  try {
    if (!companyId) return false;

    // 🔥 FIX: ensure ObjectId
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    const company = await Company.findById(companyObjectId);

    if (!company || !company.subscription) {
      throw new Error("No active subscription");
    }

    if (new Date() > new Date(company.subscription.endDate)) {
      throw new Error("Subscription expired");
    }

    const module = company.subscription.modules.find(
      (m) => m.moduleName === moduleName
    );

    if (!module) {
      console.warn(`${moduleName} not in plan`);
      return true;
    }

    const Model = modelMap[moduleName];
    if (!Model) return true;

    let count = 0;

    if (moduleName === "staff") {
      count = await Model.countDocuments({
        company: companyObjectId,
        role: { $in: ["staff", "admin"] },
      });
    } else {
      count = await Model.countDocuments({
        company: companyObjectId,
      });
    }

    // 🔥 DEBUG LOG (VERY IMPORTANT)
    console.log("---- LIMIT DEBUG ----");
    console.log("Module:", moduleName);
    console.log("Limit:", module.limit);
    console.log("Used:", count);
    console.log("Company:", companyObjectId.toString());
    console.log("---------------------");

    // 🔥 IMPORTANT FIX
    return count < module.limit;

  } catch (err) {
    console.error("checkLimit error:", err.message);
    return false;
  }
};

module.exports = checkLimit;