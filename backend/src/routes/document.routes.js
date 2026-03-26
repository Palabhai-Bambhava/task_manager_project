const express = require("express");
const router = express.Router();

const {
  createDocument,
  updateDocument,
  getDocuments,
  deleteDocument,
  updateAccess,
  upload,
} = require("../controllers/document.controller");

const protect = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/authorizePermission");

// READ
router.get("/", protect, authorizePermission("read"), getDocuments);

// CREATE
router.post(
  "/",
  protect,
  authorizePermission("create"),
  upload.single("file"),
  createDocument
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorizePermission("update"),
  upload.single("file"),
  updateDocument
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorizePermission("delete"),
  deleteDocument
);

// ACCESS CONTROL (only superadmin)
router.put(
  "/access/:docId",
  protect,
  authorizePermission("update"),
  updateAccess
);

module.exports = router;