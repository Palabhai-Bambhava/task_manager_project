const Task = require("../models/Task.model");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

// 🔹 Create Task (superadmin)
const createTask = async (req, res) => {
  try {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("VALIDATION ERRORS:", errors.array());
      return res.status(400).json({ errors: errors.array() });
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

    if (req.user.role === "staff") {
      // Staff: only assigned tasks
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedTo", "name email")
        .populate("project", "name");
    } else {
      // Superadmin: all tasks
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("project", "name"); 
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (project) task.project = project; 

    await task.save();

    const populatedTask = await task
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.json({ message: "Task updated", task: populatedTask });
  } catch (error) {
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
