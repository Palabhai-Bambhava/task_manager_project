const mongoose = require("mongoose");
const createAdmin = require("../utils/createAdmin"); // 👈 IMPORT THIS

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log("👉 Connected DB NAME:", conn.connection.name);

    await createAdmin(); // 
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;