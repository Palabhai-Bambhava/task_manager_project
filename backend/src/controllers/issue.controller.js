const Issue = require("../models/Issue.model");
const fs = require("fs");
const csv = require("csv-parser");
const stream = require("stream");
const mongoose = require("mongoose");

// CREATE ISSUE
const createIssue = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo, project } =
      req.body;

    const issue = await Issue.create({
      title,
      description,
      priority,
      status: status || "open",
      assignedTo,
      project,
      createdBy: req.user._id,
    });

    // populate fields
    await issue.populate("assignedTo", "name email");
    await issue.populate("project", "name");

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    console.error("CREATE ISSUE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ISSUES
const getIssues = async (req, res) => {
  try {
    let issues;

    if (req.user.role === "staff") {
      issues = await Issue.find({ assignedTo: req.user._id })
        .populate("project", "name")
        .populate("assignedTo", "name email");
    } else {
      issues = await Issue.find()
        .populate("project", "name")
        .populate("assignedTo", "name email");
    }

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ISSUE
const updateIssue = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Issue ID" });
  }

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const { title, description, priority, status, assignedTo, project } =
      req.body;

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (priority) issue.priority = priority;
    const allowedStatus = ["open", "in-progress", "resolved"];

    if (status && allowedStatus.includes(status)) {
      issue.status = status;
    }
    if (assignedTo) issue.assignedTo = assignedTo;
    if (project) issue.project = project;

    await issue.save();

    await issue.populate("assignedTo", "name email");
    await issue.populate("project", "name");

    res.json({
      message: "Issue updated successfully",
      issue,
    });
  } catch (error) {
    console.error("UPDATE ISSUE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE ISSUE
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUploadIssues = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    if (!req.body.project) {
      return res.status(400).json({ message: "Project is required" });
    }

    const batchSize = 1000;
    let batch = [];
    let totalInserted = 0;

    const stream = fs.createReadStream(req.file.path).pipe(csv());

    stream.on("data", async (row) => {

      const doc = {
        title: row.title,
        description: row.description,
        status: row.status
          ? row.status.toLowerCase().replace("closed", "resolved")
          : "open",
        priority: row.priority
          ? row.priority.charAt(0).toUpperCase() +
            row.priority.slice(1).toLowerCase()
          : "Medium",
        project: req.body.project,
        assignedTo:
          row.assignedTo && mongoose.Types.ObjectId.isValid(row.assignedTo)
            ? row.assignedTo.trim()
            : null,
        createdBy: req.user._id,
      };

      batch.push(doc);

      if (batch.length >= batchSize) {

        stream.pause();

        try {
          const inserted = await Issue.insertMany(batch, { ordered: false });
          totalInserted += inserted.length;
        } catch (err) {
          console.error("Batch insert error:", err);
        }

        batch = [];

        stream.resume();
      }
    });

    stream.on("end", async () => {

      if (batch.length > 0) {
        try {
          const inserted = await Issue.insertMany(batch, { ordered: false });
          totalInserted += inserted.length;
        } catch (err) {
          console.error(err);
        }
      }

      // delete uploaded CSV after processing
      fs.unlinkSync(req.file.path);

      res.json({
        message: "Bulk upload completed",
        totalInserted,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bulk upload failed" });
  }
};

module.exports = {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  bulkUploadIssues,
};
