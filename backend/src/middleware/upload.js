const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ Add file size limit here (e.g., 100MB)
module.exports = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB, increase if needed
    fieldSize: 50 * 1024 * 1024,
  },
});