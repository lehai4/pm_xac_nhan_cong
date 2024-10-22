// models/userModel.js
const db = require("../config/db");

const PhongBan = {
  getAllPhongBans: async () => {
    const [rows] = await db.query(
      "SELECT DISTINCT  pbnew.* FROM pm_phong_ban_quan_ly_new pb LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban"
    );
    return rows;
  },

  getAllPhongBansByPhuTrach: async (phu_trach) => {
    const [rows] = await db.query(
      `SELECT DISTINCT pbnew.* FROM pm_phong_ban_quan_ly_new pb
      LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
      LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp_new
      ON bp_new.id_phong_ban = pb.id
      LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp
      ON bp_new.id = bp.id
      WHERE pb.phu_trach = ?`,
      [phu_trach]
    );
    return rows;
  },

  getPhongBanById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_phong_ban_quan_ly_new WHERE id = ?",
      [numericId]
    );
    return rows[0];
  },

  // createPhongBan: async (user) => {
  //   const { id_SQL, id_phong_ban, isActived, ten_phong_ban, last_modified } =
  //     user;

  //   const [result] = await db.query(
  //     `INSERT INTO pm_phong_ban_quan_ly_new (
  //         id_SQL,id_phong_ban,isActived,ten_phong_ban,last_modified
  //       ) VALUES (?,?,?,?,? )`,
  //     [id_SQL, id_phong_ban, isActived, ten_phong_ban, last_modified]
  //   );

  //   return result.insertId;
  // },

  createPhongBan: async (phongBanArray) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      const newPhongBanIds = [];
      for (const PhongBan of phongBanArray) {
        const {
          id_SQL,
          id_phong_ban,
          isActived,
          ten_phong_ban,
          last_modified,
        } = PhongBan;

        const [result] = await connection.query(
          `INSERT INTO pm_phong_ban_quan_ly_new (
          id_SQL,id_phong_ban,isActived,ten_phong_ban,last_modified
          ) VALUES (?,?,?,?,? )`,
          [id_SQL, id_phong_ban, isActived, ten_phong_ban, last_modified]
        );

        newPhongBanIds.push(result.insertId);
      }

      await connection.commit(); // Commit transaction
      return newPhongBanIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  updatePhongBan: async (id, user) => {
    const { id_SQL, id_phong_ban, isActived, ten_phong_ban, last_modified } =
      user;

    const [result] = await db.query(
      `UPDATE pm_phong_ban_quan_ly_new
       SET id_SQL = ?,
           id_phong_ban = ?,
           isActived=?,
           ten_phong_ban=?,
           last_modified=?
       WHERE id = ?`,
      [id_SQL, id_phong_ban, isActived, ten_phong_ban, last_modified]
    );

    return result.affectedRows > 0;
  },

  deletePhongBan: async (id) => {
    await db.query("DELETE FROM pm_phong_ban_quan_ly_new WHERE id = ?", [id]);
  },
};

module.exports = PhongBan;
