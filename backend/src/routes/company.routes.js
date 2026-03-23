const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  registerCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
} = require("../controllers/company.controller");

router.get("/", protect, getCompanies);
router.post("/register", registerCompany);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);

module.exports = router;