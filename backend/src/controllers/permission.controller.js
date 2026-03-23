const Permission = require("../models/Permission.model");

// Create
const createPermission = async (req, res) => {
  const { name, value } = req.body;

  const permission = await Permission.create({ name, value });
  res.status(201).json(permission);
};

// Get All
const getPermissions = async (req, res) => {
  const permissions = await Permission.find();
  res.json(permissions);
};

// Update
const updatePermission = async (req, res) => {
  const permission = await Permission.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(permission);
};

// Delete
const deletePermission = async (req, res) => {
  await Permission.findByIdAndDelete(req.params.id);
  res.json({ message: "Permission deleted" });
};

module.exports = {
  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,
};