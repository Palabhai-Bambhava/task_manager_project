const express = require("express");
const router = require("express").Router();
const { createIssue, getIssues,updateIssue,deleteIssue,bulkUploadIssues } = require("../controllers/issue.controller");
const Project = require("../models/project.model");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");
const upload = require("../middleware/upload");

router.post("/",protect, authorize("superadmin") , createIssue);
router.get("/",protect , getIssues);
router.put("/:id", protect, authorize("superadmin"), updateIssue);
router.delete("/:id", protect, authorize("superadmin"), deleteIssue);
router.post("/bulk-upload",protect, authorize("superadmin"), upload.single("file"), bulkUploadIssues);

module.exports = router;