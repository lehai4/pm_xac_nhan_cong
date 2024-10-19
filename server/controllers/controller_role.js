const Role = require("../models/model_role.js");

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await Role.updateRole(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "Role updated successfully" });
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    console.error("Error updating Role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const RoleData = await Role.getRoleById(numericId);

    if (RoleData) {
      res.status(200).json(RoleData);
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    console.error("Error fetching Role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createRole = async (req, res) => {
  try {
    const newRoleId = await Role.createRole(req.body);
    res.status(201).json({ id: newRoleId });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await Role.deleteRole(req.params.id);
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
