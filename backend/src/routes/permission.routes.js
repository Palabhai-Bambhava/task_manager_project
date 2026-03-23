const express=require("express");
const router=express.Router();

const protect=require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");

const {  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,}= require("../controllers/permission.controller");

router.post("/", protect, authorize("superadmin"), createPermission);
router.get("/", protect, getPermissions);
router.put("/:id", protect, authorize("superadmin"), updatePermission);
router.delete("/:id", protect, authorize("superadmin"), deletePermission);


module.exports=router;