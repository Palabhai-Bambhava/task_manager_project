const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/authorizePermission");

const {
  getAllPlans,
  createPlan,
  applyPlan,
  getMyCompany,
  getUsage,
  getModules,
  updatePlan,
  deletePlan,
} = require("../controllers/subscription.controller");


// =========================
// ✅ PLAN APIs
// =========================

// GET ALL PLANS
router.get(
  "/all",
  protect,
  authorizePermission("read"),
  getAllPlans
);

// CREATE PLAN (SUPERADMIN CONTROL VIA PERMISSION)
router.post(
  "/",
  protect,
  authorizePermission("create"),
  createPlan
);

// UPDATE PLAN
router.put(
  "/:id",
  protect,
  authorizePermission("update"),
  updatePlan
);

// DELETE PLAN
router.delete(
  "/:id",
  protect,
  authorizePermission("delete"),
  deletePlan
);

// APPLY PLAN (OWNER)
router.post(
  "/apply",
  protect,
  authorizePermission("update"),
  applyPlan
);

// GET MODULE LIST (for dropdown)
router.get(
  "/modules",
  protect,
  authorizePermission("read"),
  getModules
);


// =========================
// ✅ COMPANY / USAGE
// =========================

// GET CURRENT COMPANY
router.get(
  "/my-company",
  protect,
  authorizePermission("read"),
  getMyCompany
);

// GET USAGE
router.get(
  "/usage",
  protect,
  authorizePermission("read"),
  getUsage
);

module.exports = router;