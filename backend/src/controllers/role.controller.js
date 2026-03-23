const Role = require("../models/Role.model");

const validPermissions = ["create", "read", "update", "delete"];

// ✅ Helper to clean permissions
const sanitizePermissions = (permissions) => {
  if (!permissions) return;

  const sanitized = {};

  validPermissions.forEach((key) => {
    sanitized[key] = Boolean(permissions[key]);
  });

  return sanitized;
};



// ✅ CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const role = await Role.create({
      name,
      permissions:
        sanitizePermissions(permissions) || {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
    });

    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create role",
      error: err.message,
    });
  }
};



// ✅ GET ALL ROLES (🔥 FIX: add isActive)
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}, "name permissions isActive");
    res.json(roles);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch roles",
      error: err.message,
    });
  }
};



// ✅ UPDATE ROLE (🔥 FIX: add isActive support)
exports.updateRole = async (req, res) => {
  try {
    const { name, permissions, isActive } = req.body;

    const updateData = {};

    if (name) updateData.name = name;

    if (permissions) {
      updateData.permissions = sanitizePermissions(permissions);
    }

    // 🔥 IMPORTANT FIX
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update role",
      error: err.message,
    });
  }
};



// ✅ DELETE ROLE
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.name === "superadmin") {
      return res.status(400).json({
        message: "Superadmin role cannot be deleted",
      });
    }

    await role.deleteOne();

    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};