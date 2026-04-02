const Project = require("../models/project.model");
const checkLimit = require("../utils/checkLimit");
const mongoose = require("mongoose");

// GET PROJECTS
const getProjects = async (req, res) => {
  try {
    const { company } = req.query;

    let query = {};

    // Filter by company if provided
    if (company) {
      query.company = company;
    } else if (req.user.role !== "superadmin") {
      // For owner/staff: only show projects of their company
      query.company = req.user.company;
    }

    // Staff can only see projects assigned to them
    if (req.user.role === "staff") {
      query.assignedStaff = req.user._id;
    }

    const projects = await Project.find(query)
      .populate("assignedStaff", "name email")
      .populate("company", "name");

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    // if (req.user.role !== "superadmin") {
    //   return res.status(403).json({
    //     message: "Only superadmin can create project",
    //   });
    // }
    const companyId = req.user.company; // ✅ NEW

    // 🔥 CHECK PLAN LIMIT
    const allowed = await checkLimit(companyId, "project");

    if (!allowed) {
      return res.status(403).json({
        message: "Project limit reached. Upgrade your plan.",
      });
    }
    const { name, status, assignedStaff, } = req.body;

    const project = new Project({
      name,
      status,
      assignedStaff,
      company: companyId,
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    // ✅ Allow superadmin + owner
    if (!["superadmin", "owner"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Not allowed to update project",
      });
    }

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Project ID" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Owner can only update their company project
    if (
      req.user.role === "owner" &&
      project.company.toString() !== req.user.company.toString()
    ) {
      return res.status(403).json({
        message: "You can only update your own company projects",
      });
    }

    // ✅ Update safely
    const { name, status, assignedStaff } = req.body;

    if (name) project.name = name;
    if (status) project.status = status;
    if (assignedStaff) project.assignedStaff = assignedStaff;

    await project.save();

    await project.populate("assignedStaff", "name email");

    res.status(200).json(project);
  } catch (error) {
    console.error("🔥 UPDATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    if (!["superadmin", "owner"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Not allowed to delete project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
