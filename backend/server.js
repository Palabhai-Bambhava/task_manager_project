const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();


const connectDB = require("./src/config/db");

// ✅ Import Routes
const authRoutes = require("./src/routes/auth.routes");
const staffRoutes = require("./src/routes/staff.routes");
const createAdmin = require("./src/utils/createAdmin");
const taskRoutes = require("./src/routes/task.routes");
const roleRoutes = require("./src/routes/role.routes");
const projectRoutes = require("./src/routes/project.routes");
const issueRoutes = require("./src/routes/issue.routes");
const documentRoutes = require("./src/routes/document.routes"); 
const companyRoutes = require("./src/routes/company.routes");
const subscription=require("./src/routes/subscription.routes");

const app = express();

// ✅ Connect Database
connectDB().then(() => {
  createAdmin();
});

// ✅ Middlewares
// ⚡ CORS config
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true,               // allow cookies
}));
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
// app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded(({ limit: "100mb", extended: true })));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/permissions", require("./src/routes/permission.routes"));
app.use("/api/roles", roleRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/subscription", subscription);


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Task Manager API Running 🚀");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});