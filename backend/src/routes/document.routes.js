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
const authorize = require("../middleware/authorizeRoles");

router.get("/", protect, getDocuments);

router.post(
  "/",
  protect,
  authorize("superadmin"),
  upload.single("file"),
  createDocument
);

router.put(
  "/:id",
  protect,
  authorize("superadmin"),
  upload.single("file"),
  updateDocument
);

router.delete("/:id", protect, authorize("superadmin"), deleteDocument);

router.put("/access/:docId", protect, authorize("superadmin"), updateAccess);

module.exports = router;