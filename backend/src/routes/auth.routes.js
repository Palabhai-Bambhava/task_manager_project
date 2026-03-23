const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

// Controllers
const { login } = require("../controllers/auth.controller");
const { registerCompany } = require("../controllers/company.controller");

// 🔐 AUTH
router.post("/login", login);

// 👤 CURRENT USER
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// 🏢 COMPANY REGISTER (OWNER CREATE)
router.post("/register-company", registerCompany);

module.exports = router;