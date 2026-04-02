const Task = require("../models/Task.model");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const checkLimit = require("../utils/checkLimit");

// 🔹 Create Task (superadmin)
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("VALIDATION ERRORS:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const companyId = req.user.company;

    // const allowed = await checkLimit(companyId, "task");

    // ✅ FIX 2: skip limit check for superadmin (they have no company)
    if (req.user.role !== "superadmin") {
      const allowed = await checkLimit(companyId, "task");
      if (!allowed) {
        return res.status(403).json({
          message: "Task limit reached. Please upgrade your subscription.",
        });
      }
    }

    const { title, description, assignedTo, status, project } = req.body;

    // Validate required fields
    if (!title || !assignedTo || !project) {
      return res
        .status(400)
        .json({ message: "Title, assignedTo, and project are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      project,
      createdBy: req.user._id,
      company: companyId,
    });

    // populate fields separately
    await task.populate("assignedTo", "name email");
    await task.populate("project", "name");

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error("🔥 CREATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Tasks
const getTasks = async (req, res) => {
  try {
    let tasks;

    // 1️⃣ Superadmin
    if (req.user.role === "superadmin") {
      tasks = await Task.find(
        req.query.company ? { company: req.query.company } : {},
      )
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .populate("company", "_id name");
    }
    // 2️⃣ Owner
    else if (req.user.role === "owner") {
      tasks = await Task.find({ company: req.user.company })
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .populate("company", "_id name");
    }
    // 3️⃣ Staff
    else if (req.user.role === "staff") {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .populate("company", "_id name");
    } else {
      tasks = [];
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update Task Status (staff can update own, superadmin any)
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role !== "superadmin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status || task.status;
    await task.save();

    const populatedTask = await task
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.json({ message: "Task status updated", task: populatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Full Task Update (superadmin only)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignedTo, status, project } = req.body;

  // ✅ Validate Task ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    // ✅ Allow only superadmin + owner
    if (!["superadmin", "owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Validate assignedTo
    if (assignedTo && assignedTo !== "") {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo ID" });
      }
      task.assignedTo = assignedTo;
    }

    // ✅ Validate project
    if (project && project !== "") {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      task.project = project;
    }

    // ✅ Update fields safely
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();

    // ✅ Validate status (optional but recommended)
    const validStatus = ["pending", "in-progress", "completed"];
    if (status && validStatus.includes(status)) {
      task.status = status;
    }

    await task.save();

    // ✅ Populate properly
    await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "project", select: "name" },
    ]);

    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("🔥 UPDATE TASK ERROR:", error); // VERY IMPORTANT
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Delete Task (superadmin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
