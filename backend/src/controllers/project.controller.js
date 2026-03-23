const Project = require("../models/project.model");

// GET PROJECTS
const getProjects = async (req, res) => {
  try {
    const { company } = req.query;

    let query = {};

    // filter by company
    if (company) {
      query.company = company;
    }

    let projects;

    // superadmin -> all projects
    if (req.user.role === "superadmin") {
      projects = await Project.find().populate("assignedStaff", "name email")
      .populate("company", "name");
    }

    // staff -> only assigned
    else {
      projects = await Project.find({
        assignedStaff: req.user._id,
      }).populate("assignedStaff", "name email")
      .populate("company", "name");
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmin can create project",
      });
    }

    const { name, status, assignedStaff, } = req.body;

    const project = new Project({
      name,
      status,
      assignedStaff,
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
