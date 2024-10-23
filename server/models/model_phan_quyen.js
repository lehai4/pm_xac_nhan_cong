// models/userModel.js
const db = require("../config/db");
const moment = require("moment"); // Đảm bảo bạn đã cài đặt moment

const PhanQuyen = {
  getAllPhanQuyens: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_phan_quyen");
    return rows;
  },

  getPhanQuyenById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_phan_quyen WHERE id = ?",
      [numericId]
    );
    return rows[0];
  },

  createPhanQuyen: async (user) => {
    const { id_phan_quyen, ten_phan_quyen, id_role, id_nv } = user;

    const [result] = await db.query(
      `INSERT INTO pm_luong_phan_quyen (
          id_phan_quyen,ten_phan_quyen,id_role,id_nv
        ) VALUES (?, ?,?,? )`,
      [id_phan_quyen, ten_phan_quyen, id_role, id_nv]
    );

    return result.insertId;
  },

  updatePhanQuyen: async (id, user) => {
    const { id_phan_quyen, ten_phan_quyen, id_role, id_nv } = user;

    const [result] = await db.query(
      `UPDATE pm_luong_phan_quyen
       SET id_phan_quyen = ?,
           ten_phan_quyen = ?,
           id_role=?,
           id_nv=?
       WHERE id = ?`,
      [id_phan_quyen, ten_phan_quyen, id_role, id_nv]
    );

    return result.affectedRows > 0;
  },

  addMutiPhanQuyenSalary: async (data, id_dot) => {
    // console.log("data", data);
    // Kiểm tra nếu data là một mảng
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu phải là một mảng");
    }

    try {
      const promises = data.map(({ id_phong_ban, time_start, time_end }) => {
        const formattedTimeStart = moment(time_start).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        const formattedTimeEnd = moment(time_end).format("YYYY-MM-DD HH:mm:ss");
        return db.query(
          `
                INSERT INTO pm_luong_dot_phong_ban_time_allow_view (id_dot, id_phong_ban, time_start, time_end)
                VALUES (?, ?, ?, ?);
            `,
          [id_dot, id_phong_ban, formattedTimeStart, formattedTimeEnd]
        );
      });

      const results = await Promise.all(promises); // Thực hiện tất cả các câu lệnh INSERT

      return results; // Trả về kết quả nếu cần
    } catch (error) {
      throw new Error(error.message); // Ném lỗi nếu có
    }
  },

  addMutiPhanQuyenDotCong: async (data, id_dot) => {
    // Kiểm tra nếu data là một mảng
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu phải là một mảng");
    }

    try {
      const promises = data.map(({ id_phong_ban, time_start, time_end }) => {
        const formattedTimeStart = moment(time_start).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        const formattedTimeEnd = moment(time_end).format("YYYY-MM-DD HH:mm:ss");
        return db.query(
          `
               INSERT INTO pm_cong_dot_phong_ban_time_allow_view (id_dot, id_phong_ban, time_start, time_end)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  time_start = VALUES(time_start),
                  time_end = VALUES(time_end);
            `,
          [id_dot, id_phong_ban, formattedTimeStart, formattedTimeEnd]
        );
      });

      const results = await Promise.all(promises); // Thực hiện tất cả các câu lệnh INSERT

      return results; // Trả về kết quả nếu cần
    } catch (error) {
      throw new Error(error.message); // Ném lỗi nếu có
    }
  },

  deletePhanQuyen: async (id) => {
    await db.query("DELETE FROM pm_luong_phan_quyen WHERE id = ?", [id]);
  },
};

module.exports = PhanQuyen;
