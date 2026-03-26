const Project = require("../models/project.model");
const checkLimit = require("../utils/checkLimit");

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
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmin can edit project",
      });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmin can delete project",
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
