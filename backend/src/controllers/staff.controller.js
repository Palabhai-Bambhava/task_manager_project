const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const sendEmail = require("../utils/sendEmail");

const createStaff = async (req, res) => {
  try {
    const { name, email, role, phone, isActive } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    // ⭐ PHONE VALIDATION
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔥 Generate Random Password
    const randomPassword = "123456";

    // 🔐 Hash Password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    if (req.user.role !== "superadmin" && req.body.role !== "staff") {
      return res.status(403).json({
        message: "Only superadmin can create admin",
      });
    }

    // 💾 Save User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || "staff",
      isActive: isActive !== undefined ? isActive : true,
    });

    // 📧 Send Email
    await sendEmail(
      email,
      "Your Account Credentials",
      `
        <h2>Welcome to Task Manager</h2>
        <p>Your account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        <p>Please login and change your password.</p>
      `,
    );

    res.status(201).json({
      message: "User created and email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    if (req.user.role === "staff") {
      const staff = await User.findById(req.user._id).select(
        "_id name email role phone isActive",
      );

      return res.json([staff]);
    }

    const staff = await User.find({
      role: { $in: ["staff", "admin"] },
    }).select("_id name email role phone isActive");

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Staff
const updateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "User not found" });
    }

    // staff can update only themselves
    if (
      req.user.role === "staff" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        message: "You can update only your profile",
      });
    }

    const { name, email, phone, role, isActive } = req.body;

    if (name !== undefined) staff.name = name;
    if (email !== undefined) staff.email = email;
    if (phone !== undefined) staff.phone = phone;

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    // ⭐ Only superadmin can change role
    if (role !== undefined && req.user.role === "superadmin") {
      staff.role = role;
    }

    // ⭐ Only superadmin can change status
    if (isActive !== undefined && req.user.role === "superadmin") {
      staff.isActive = isActive;
    }

    await staff.save();

    res.json({
      message: "User updated successfully",
      staff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $in: ["staff", "admin"] },
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStaff, getStaff, updateStaff, deleteStaff };
