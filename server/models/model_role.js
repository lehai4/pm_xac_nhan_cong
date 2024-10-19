// models/userModel.js
const db = require("../config/db");

const Role = {
  getAllRoles: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_role");
    return rows;
  },

  getRoleById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query("SELECT * FROM pm_luong_role WHERE id = ?", [
      numericId,
    ]);
    return rows[0];
  },

  createChiNgoai: async (user) => {
    const { id_role, ten_role } = user;

    const [result] = await db.query(
      `INSERT INTO pm_luong_role (
          id_role,ten_role
        ) VALUES (?, ?, )`,
      [id_role, ten_role]
    );

    return result.insertId;
  },

  updateChiNgoai: async (id, user) => {
    const { id_role, ten_role } = user;

    const [result] = await db.query(
      `UPDATE pm_luong_role
       SET id_role = ?,
           ten_role = ?,
       WHERE id = ?`,
      [id_role, ten_role]
    );

    return result.affectedRows > 0;
  },

  deleteChiNgoai: async (id) => {
    await db.query("DELETE FROM pm_luong_role WHERE id = ?", [id]);
  },
};

module.exports = Role;
