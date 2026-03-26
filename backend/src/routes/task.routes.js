const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");
const authorizePermission = require("../middleware/authorizePermission");

const {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require("../controllers/task.controller");

// Create Task
router.post(
  "/",
  protect,
  authorizePermission("create"),
  createTask
);

// Get Tasks
router.get(
  "/",
  protect,
  authorizePermission("read"),
  getTasks
);

// Update Status
router.put("/:id/status", protect, updateTaskStatus);

// Update Task
router.put(
  "/:id",
  protect,
  authorizePermission("update"),
  updateTask
);

// Delete
router.delete(
  "/:id",
  protect,
  authorizePermission("delete"),
  deleteTask
);
module.exports = router;