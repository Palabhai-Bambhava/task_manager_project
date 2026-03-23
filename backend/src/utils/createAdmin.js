const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {

    // role  logic 
    const existingAdmin = await User.findOne({ role: "superadmin" });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const admin = new User({
      name: "Super Admin",
      email: "admin@yopmail.com",
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
    });

    await admin.save();

    console.log("🔥 Super Admin Created Successfully");
  } catch (error) {
    console.log("❌ Error creating admin:", error.message);
  }
};

module.exports = createAdmin;