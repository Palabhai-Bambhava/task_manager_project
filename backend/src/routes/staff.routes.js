const express = require("express");
const router = express.Router();
const { createStaff,updateStaff,deleteStaff, getStaff } = require("../controllers/staff.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");

router.get("/", protect, getStaff);
router.post("/", protect, authorize("superadmin"), createStaff);
router.put("/:id", protect, updateStaff);
router.delete("/:id", protect, authorize("superadmin"), deleteStaff);

module.exports = router;