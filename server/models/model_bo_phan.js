// models/userModel.js
const db = require("../config/db");

const BoPhan = {
  getAllBoPhans: async () => {
    const [rows] = await db.query("SELECT * FROM sync_data_hi_time_sheet.sync_bo_phan");
    return rows;
  },

  getBoPhanById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query("SELECT * FROM sync_data_hi_time_sheet.sync_bo_phan WHERE id = ?", [
      numericId,
    ]);
    return rows[0];
  },

  createBoPhan: async (boPhanArray) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      const newBoPhanIds = [];
      for (const boPhan of boPhanArray) {
        const {
          id_SQL,
          id_bo_phan,
          isActived,
          ten_bo_phan,
          id_phong_ban,
          last_modified,
        } = boPhan;

        const [result] = await connection.query(
          `INSERT INTO sync_data_hi_time_sheet.sync_bo_phan (
              id_SQL,id_bo_phan,isActived,ten_bo_phan, id_phong_ban,last_modified
            ) VALUES (?,?,?,?,?,? )`,
          [
            id_SQL,
            id_bo_phan,
            isActived,
            ten_bo_phan,
            id_phong_ban,
            last_modified,
          ]
        );

        newBoPhanIds.push(result.insertId);
      }

      await connection.commit(); // Commit transaction
      return newBoPhanIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  updateBoPhan: async (id, user) => {
    const {
      id_SQL,
      id_bo_phan,
      isActived,
      ten_bo_phan,
      id_phong_ban,
      last_modified,
    } = user;

    const [result] = await db.query(
      `UPDATE sync_data_hi_time_sheet.sync_bo_phan
       SET id_SQL = ?,
           id_bo_phan = ?,
           isActived=?,
           ten_bo_phan=?,
           id_phong_ban=?,
           last_modified=?
       WHERE id = ?`,
      [id_SQL, id_bo_phan, isActived, ten_bo_phan, id_phong_ban, last_modified]
    );

    return result.affectedRows > 0;
  },

  deleteBoPhan: async (id) => {
    await db.query("DELETE FROM sync_data_hi_time_sheet.sync_bo_phan WHERE id = ?", [id]);
  },

  // Lấy danh sách bộ phận theo phụ trách
  getBoPhanByPhuTrach: async (phuTrach) => {
    const [rows] = await db.query(
      "SELECT bp.* FROM pm_bo_phan_quan_ly_new bpnew LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bpnew.id_bo_phan = bp.id WHERE bpnew.phu_trach = ?",
      [phuTrach]
    );
    return rows;
  },
};

module.exports = BoPhan;
