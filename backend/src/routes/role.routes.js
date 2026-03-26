const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");
const authorizePermission = require("../middleware/authorizePermission");

// CREATE ROLE
router.post(
  "/",
  protect,
  authorize("superadmin"),
  roleController.createRole
);

// GET ROLES
router.get(
  "/",
  protect,
  authorize("superadmin", "admin", "owner"),
  roleController.getRoles
);

// UPDATE ROLE PERMISSIONS
router.put(
  "/:id",
  protect,
  authorize("superadmin"),
  roleController.updateRole
);

// DELETE ROLE
router.delete(
  "/:id",
  protect,
  authorize("superadmin"),
  roleController.deleteRole
);

module.exports = router;