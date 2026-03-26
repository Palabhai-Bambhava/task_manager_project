const express = require("express");
const router = express.Router();
const { createStaff,updateStaff,deleteStaff, getStaff } = require("../controllers/staff.controller");
const protect = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/authorizePermission");

router.get("/", protect,authorizePermission("read"), getStaff);
router.post("/", protect, authorizePermission("create"), createStaff);
router.put("/:id", protect,authorizePermission("update"), updateStaff);
router.delete("/:id", protect, authorizePermission("delete"), deleteStaff);

module.exports = router;