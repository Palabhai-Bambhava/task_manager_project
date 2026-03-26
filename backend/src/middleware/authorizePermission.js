const Role = require("../models/Role.model");

const authorizePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // ✅ SUPERADMIN
      if (req.user.role === "superadmin") return next();

      // ✅ OWNER (🔥 MUST)
      if (req.user.role === "owner") return next();

      const role = await Role.findOne({
        name: req.user.role,
        company: req.user.company,
        isActive: true,
      });

      if (!role) {
        return res.status(403).json({
          message: "Role not found or inactive",
        });
      }

      if (!role.permissions || !role.permissions[permission]) {
        return res.status(403).json({
          message: `No ${permission} permission`,
        });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Authorization error",
      });
    }
  };
};

module.exports = authorizePermission;