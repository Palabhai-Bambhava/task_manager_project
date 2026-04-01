const Issue = require("../models/Issue.model");
const fs = require("fs");
const csv = require("csv-parser");
const stream = require("stream");
const mongoose = require("mongoose");
const Project = require("../models/project.model");
const checkLimit = require("../utils/checkLimit");
const Company = require("../models/Company.model");

// CREATE ISSUE
const createIssue = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo, project } =
      req.body;

    if (!project) {
      return res.status(400).json({ message: "Project is required" });
    }

    const projectDoc = await Project.findById(project).select("company");
    const company = projectDoc?.company || req.user.company;

    if (!company) {
      return res.status(400).json({
        message: "Company not found",
      });
    }

    const companyId = company._id || company;
    // 🔥 LIMIT CHECK
    if (req.user.role !== "superadmin") {
      if (!company) {
        return res.status(400).json({
          message: "Company not found for this issue",
        });
      }

      const companyId = company?._id || company;

      const allowed = await checkLimit(companyId, "issue");

      if (!allowed) {
        return res.status(403).json({
          message: "Issue limit reached. Upgrade your plan.",
        });
      }
    }

    const issue = await Issue.create({
      title,
      description,
      priority,
      status: status || "open",
      assignedTo,
      project,
      company,
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
    let query = {};

    // ✅ superadmin can filter by company via query param
    if (req.user.role === "superadmin") {
      if (req.query.company) {
        // find all projects that belong to this company, then get issues for those projects

        const projects = await Project.find({
          company: req.query.company,
        }).select("_id");
        const projectIds = projects.map((p) => p._id);
        query.project = { $in: projectIds };
      }
      // no company filter = all issues
    } else if (req.user.role === "owner") {
      // owner sees issues only for their company's projects

      const projects = await Project.find({ company: req.user.company }).select(
        "_id",
      );
      const projectIds = projects.map((p) => p._id);
      query.project = { $in: projectIds };
    } else if (req.user.role === "staff") {
      // staff sees only assigned issues
      query.assignedTo = req.user._id;
    }

    const issues = await Issue.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name email");

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

    const projectDoc = await Project.findById(req.body.project).select(
      "company",
    );
    const company = projectDoc?.company || req.user.company;

    if (!company) {
      return res.status(400).json({
        message: "Company not found for bulk upload",
      });
    }

    const companyId = company?._id || company;

    // ✅ GET COMPANY + LIMIT
    const companyDoc = await Company.findById(companyId);

    const issueModule = companyDoc.subscription?.modules.find(
      (m) => m.moduleName === "issue",
    );

    const limit = issueModule?.limit || 0;

    const currentCount = await Issue.countDocuments({ company: companyId });

    let remaining = limit - currentCount;

    if (remaining <= 0) {
      return res.status(403).json({
        message: "Issue limit reached. Cannot upload more.",
      });
    }

    const batchSize = 1000;
    let batch = [];
    let totalInserted = 0;

    const stream = fs.createReadStream(req.file.path).pipe(csv());

    stream.on("data", async (row) => {
      // 🔥 STOP IF LIMIT REACHED
      if (remaining <= 0) {
        stream.destroy();
        return;
      }

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
        company: companyId, // ✅ FIXED
        assignedTo:
          row.assignedTo && mongoose.Types.ObjectId.isValid(row.assignedTo)
            ? row.assignedTo.trim()
            : null,
        createdBy: req.user._id,
      };

      batch.push(doc);
      remaining--; // 🔥 IMPORTANT

      // INSERT BATCH
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
      if (batch.length > 0 && remaining >= 0) {
        try {
          const inserted = await Issue.insertMany(batch, { ordered: false });
          totalInserted += inserted.length;
        } catch (err) {
          console.error(err);
        }
      }

      fs.unlinkSync(req.file.path);

      res.json({
        message: "Bulk upload completed",
        totalInserted,
        remainingLimit: remaining,
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
