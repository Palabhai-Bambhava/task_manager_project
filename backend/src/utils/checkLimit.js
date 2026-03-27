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

  if (!companyId) return false;
  
  const company = await Company.findById(companyId);

  // ❌ No subscription
  if (!company || !company.subscription) {
    throw new Error("No active subscription");
  }

  // ❌ Expired
  if (new Date() > new Date(company.subscription.endDate)) {
    throw new Error("Subscription expired");
  }

  // 🔍 Find module
  const module = company.subscription.modules.find(
    (m) => m.moduleName === moduleName
  );

  // ✅ SAFE FIX (IMPORTANT)
  if (!module) {
    console.warn(`${moduleName} not in plan`);
    return true;
  }

  const Model = modelMap[moduleName];
  if (!Model) return true;

  let count = 0;

  if (moduleName === "staff") {
    count = await Model.countDocuments({
      company: companyId,
      role: { $in: ["staff", "admin"] },
    });
  } else {
    count = await Model.countDocuments({
      company: companyId,
    });
  }

  return count < module.limit;
};

module.exports = checkLimit;