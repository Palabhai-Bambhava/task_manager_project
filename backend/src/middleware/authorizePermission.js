const Role = require("../models/Role.model");

module.exports = (permission) => {
  return async (req, res, next) => {
    try {

      // ⭐ SUPERADMIN BYPASS
      if (req.user.role === "superadmin") {
        return next();
      }

      const role = await Role.findOne({ name: req.user.role });

      if (!role) {
        return res.status(403).json({ message: "Role not found" });
      }

      if (!role.permissions[permission]) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Authorization error" });
    }
  };
};