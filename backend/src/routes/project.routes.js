const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorizeRoles");

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/project.controller");


// GET PROJECTS
router.get("/", protect, getProjects);

// CREATE PROJECT
router.post("/", protect, authorize("superadmin"), createProject);

// UPDATE PROJECT
router.put("/:id", protect, authorize("superadmin"), updateProject);

// DELETE PROJECT
router.delete("/:id", protect, authorize("superadmin"), deleteProject);

module.exports = router;