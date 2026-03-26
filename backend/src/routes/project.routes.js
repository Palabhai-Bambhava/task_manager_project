const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/authorizePermission");

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/project.controller");


// GET PROJECTS
router.get("/", protect,authorizePermission("read"), getProjects);

// CREATE PROJECT
router.post("/", protect, authorizePermission("create"), createProject);

// UPDATE PROJECT
router.put("/:id", protect, authorizePermission("update"), updateProject);

// DELETE PROJECT
router.delete("/:id", protect, authorizePermission("delete"), deleteProject);

module.exports = router;