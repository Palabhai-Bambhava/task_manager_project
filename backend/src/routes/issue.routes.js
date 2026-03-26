const express = require("express");
const router = express.Router();

const {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  bulkUploadIssues
} = require("../controllers/issue.controller");

const protect = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/authorizePermission");
const upload = require("../middleware/upload");

// CREATE
router.post("/", protect, authorizePermission("create"), createIssue);

// READ
router.get("/", protect, authorizePermission("read"), getIssues);

// UPDATE
router.put("/:id", protect, authorizePermission("update"), updateIssue);

// DELETE
router.delete("/:id", protect, authorizePermission("delete"), deleteIssue);

// BULK
router.post(
  "/bulk-upload",
  protect,
  authorizePermission("create"),
  upload.single("file"),
  bulkUploadIssues
);

module.exports = router;