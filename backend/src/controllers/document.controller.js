const Document = require("../models/Document.model");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const DocumentPage = require("../models/DocumentPage.model");
const PAGE_SIZE_MB = 10;
const PAGE_SIZE_BYTES = PAGE_SIZE_MB * 1024 * 1024;
const Project = require("../models/project.model");
const checkLimit = require("../utils/checkLimit");

/* ---------------- MULTER ---------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/documents";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 50 * 1024 * 1024,
    fileSize: 50 * 1024 * 1024,
  },
});

// Split content into pages
function splitContentToPages(content) {
  // 🔥 split using frontend page break
  const rawPages = content.split("<!--PAGE_BREAK-->");

  return rawPages.map((p, index) => ({
    pageNumber: index + 1,
    content: p,
  }));
}

/* ---------------- CREATE DOCUMENT ---------------- */

const createDocument = async (req, res) => {
  try {
    const { name, description, editorContent, type, project, autoSave } =
      req.body;

    if (!project) {
      return res.status(400).json({ message: "Project is required" });
    }

    const projectDoc = await Project.findById(project).select("company");
    const company = projectDoc?.company || req.user.company || null;

    // 🔥 LIMIT CHECK
    if (req.user.role !== "superadmin") {
      if (!company) {
        return res.status(400).json({
          message: "Company not found for this document",
        });
      }

      const allowed = await checkLimit(company, "document");

      if (!allowed) {
        return res.status(403).json({
          message: "Document limit reached. Upgrade your plan.",
        });
      }
    }

    // ✅ FIX access parsing
    let access = [];
    if (req.body.access) {
      if (typeof req.body.access === "string") {
        try {
          access = JSON.parse(req.body.access);
        } catch {}
      } else {
        access = req.body.access;
      }
    }

    let fileUrl = null;

    if (type === "file") {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }
      fileUrl = `/uploads/documents/${req.file.filename}`;
    }

    if (type === "text" && !editorContent) {
      return res.status(400).json({ message: "Editor content is required" });
    }

    // ✅ STEP 1: CREATE DOCUMENT FIRST
    const document = await Document.create({
      name,
      description,
      project,
      company,
      type,
      fileUrl,
      pages: [],
      access,
      autoSave,
      createdBy: req.user._id,
    });

    let pageIds = [];

    // ✅ STEP 2: CREATE PAGES WITH document ID
    if (type === "text") {
      const pages = splitContentToPages(editorContent);

      for (const p of pages) {
        const page = await DocumentPage.create({
          document: document._id,
          pageNumber: p.pageNumber,
          content: p.content,
        });

        pageIds.push(page._id);
      }
    }

    // ✅ STEP 3: UPDATE DOCUMENT WITH PAGES
    document.pages = pageIds;
    await document.save();

    res.status(201).json({
      message: "Document created",
      document,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPDATE DOCUMENT ---------------- */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, editorContent, type, autoSave } = req.body;

    // 1️⃣ Find the document and populate pages
    const document = await Document.findById(id).populate("pages");
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    // 2️⃣ Parse access correctly
    let access = req.body.access || [];

    // If FormData sends numeric keys (access[0], access[1])
    if (typeof access === "object" && !Array.isArray(access)) {
      access = Object.values(access);
    }

    // If access is a stringified JSON
    if (typeof access === "string") {
      try {
        access = JSON.parse(access);
      } catch {
        access = [];
      }
    }

    // Normalize structure
    access = access
      .map((a) => {
        const userId = typeof a.user === "object" ? a.user?._id : a.user;
        return {
          user: userId,
          canView:
            a.canView === true || a.canView === "true" || a.canEdit === true,
          canEdit: a.canEdit === true || a.canEdit === "true",
        };
      })
      .filter((a) => a.user);

    // 3️⃣ Update basic fields
    document.name = name || document.name;
    document.description = description || document.description;
    document.autoSave = autoSave ?? document.autoSave;
    document.access = access;

    const fs = require("fs");
    const path = require("path");

    // 4️⃣ Handle text type
    if (type === "text") {
      if (!editorContent)
        return res.status(400).json({ message: "Editor content required" });

      // Delete old page files and DB entries
      for (const p of document.pages) {
        if (
          p.filePath &&
          fs.existsSync(path.join(__dirname, "..", p.filePath))
        ) {
          fs.unlinkSync(path.join(__dirname, "..", p.filePath));
        }
        await DocumentPage.findByIdAndDelete(p._id);
      }

      // Create new pages
      let pages = splitContentToPages(editorContent);
      const createdPages = [];
      for (const p of pages) {
        const page = await DocumentPage.create({
          ...p,
          document: document._id,
        });
        createdPages.push(page);
      }
      document.pages = createdPages.map((p) => p._id);
      document.type = "text";
      document.fileUrl = null;
    }

    // 5️⃣ Handle file type
    if (type === "file" && req.file) {
      // Delete old pages if switching from text to file
      for (const p of document.pages) {
        if (
          p.filePath &&
          fs.existsSync(path.join(__dirname, "..", p.filePath))
        ) {
          fs.unlinkSync(path.join(__dirname, "..", p.filePath));
        }
        await DocumentPage.findByIdAndDelete(p._id);
      }
      document.pages = [];

      // Delete old file if exists
      if (
        document.fileUrl &&
        fs.existsSync(path.join(__dirname, "..", document.fileUrl))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", document.fileUrl));
      }

      document.fileUrl = `/uploads/documents/${req.file.filename}`;
      document.type = "file";
    }

    // 6️⃣ Save document
    await document.save();

    // 7️⃣ Populate access.user before sending response
    await document.populate("access.user", "name email");

    res.json({ message: "Document updated", document });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET DOCUMENTS ---------------- */

const getDocuments = async (req, res) => {
  try {
    const { project } = req.query;

    let query = {};

    if (project) {
      query.project = project;
    } else if (req.user.role === "superadmin") {
      // ✅ superadmin company filter
      if (req.query.company) {
        const projects = await Project.find({
          company: req.query.company,
        }).select("_id");
        const projectIds = projects.map((p) => p._id);
        query.project = { $in: projectIds };
      }
      // no filter = all documents
    } else if (req.user.role === "owner") {
      // ✅ owner sees only their company's documents
      const projects = await Project.find({ company: req.user.company }).select(
        "_id",
      );
      const projectIds = projects.map((p) => p._id);
      query.project = { $in: projectIds };
    } else if (req.user.role === "staff") {
      // staff sees only documents they have access to — handled in frontend already
      // but we still scope to their projects for safety
      const projects = await Project.find({ company: req.user.company }).select(
        "_id",
      );
      const projectIds = projects.map((p) => p._id);
      query.project = { $in: projectIds };
    }

    const docs = await Document.find(query)
      .populate("createdBy", "name email")
      .populate("access.user", "name email")
      .populate({
        path: "pages",
        options: { sort: { pageNumber: 1 } }, // important for correct order
      })
      .populate("project", "_id name");

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DELETE DOCUMENT ---------------- */

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.fileUrl) {
      const filePath = path.join(__dirname, "..", doc.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPDATE ACCESS ---------------- */

const updateAccess = async (req, res) => {
  try {
    const { docId } = req.params;

    let { access } = req.body;
    console.log("RAW REQ BODY:", req.body);

    // 1️⃣ Convert FormData numeric keys to array
    if (access && typeof access === "object" && !Array.isArray(access)) {
      access = Object.values(access);
    }

    // 2️⃣ Parse stringified JSON if needed
    if (typeof access === "string") {
      try {
        access = JSON.parse(access);
      } catch {
        access = [];
      }
    }

    // 3️⃣ Normalize structure and booleans
    access = (access || [])
      .map((a) => {
        const userId = typeof a.user === "object" ? a.user?._id : a.user;

        return {
          user: userId,
          canView:
            a.canView === true || a.canView === "true" || a.canEdit === true,
          canEdit: a.canEdit === true || a.canEdit === "true",
        };
      })
      .filter((a) => a.user); // remove invalid entries

    console.log("NORMALIZED ACCESS:", access);

    // 4️⃣ Update document
    const doc = await Document.findByIdAndUpdate(
      docId,
      { access },
      { new: true },
    ).populate("access.user", "name email");

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      message: "Access updated",
      document: doc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDocument,
  updateDocument,
  getDocuments,
  deleteDocument,
  updateAccess,
  upload,
};
