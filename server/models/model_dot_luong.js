// models/userModel.js
const db = require("../config/db");
const moment = require("moment");

const DotLuong = {
  getAllDotLuongs: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_dot");
    return rows;
  },

  getDotLuongByMonth: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_dot WHERE bang_luong_t = ? AND is_Active = 1",
      [month]
    );
    return rows;
  },

  getDotLuongByMonthNoActive: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_dot WHERE bang_luong_t = ?",
      [month]
    );
    return rows;
  },

  getDotLuongById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      `  SELECT 
          ld.*
          FROM 
          pm_luong_dot AS ld
          JOIN 
          pm_luong_dot_phong_ban_time_allow_view AS lpb 
          ON 
          ld.id = lpb.id_dot
        WHERE 
      ld.id = ? 
      AND ld.is_Active = 1;`,
      [numericId]
    );
    return rows[0];
  },

  getDotLuongByPeriodName: async (periodName) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_dot WHERE ten_dot = ? AND is_Active = 1",
      [periodName]
    );
    return rows[0];
  },

  // Thêm nhiều cùng 1 lúc
  createDotLuong: async (DotLuongArray) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction
      const newDotLuongIds = [];
      for (const DotLuong of DotLuongArray) {
        const {
          ten_dot,
          bang_luong_t,
          ngay_thanh_toan,
          time_start,
          time_end,
          time_xem,
          loai_phieu,
          time_start_ql,
          time_end_ql,
          is_Active,
        } = DotLuong;

        const [result] = await connection.query(
          `INSERT INTO pm_luong_dot (
              ten_dot, bang_luong_t, ngay_thanh_toan, time_start, time_end, time_xem,loai_phieu, time_start_ql, time_end_ql, is_Active
            ) VALUES (?, ?, ?, ?, ?, ?,?,?,?,1)`,
          [
            ten_dot,
            bang_luong_t,
            ngay_thanh_toan,
            time_start,
            time_end,
            time_xem,
            loai_phieu,
            time_start_ql,
            time_end_ql,
            is_Active,
          ]
        );
        newDotLuongIds.push(result.insertId);
      }

      await connection.commit(); // Commit transaction
      return newDotLuongIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },
  // updateDotLuong: async (id, dotLuong) => {
  //   const { time_start, time_end, time_xem } = dotLuong;

  //   const [result] = await db.query(
  //     `UPDATE pm_luong_dot
  //      SET time_start=?,
  //          time_end=?,
  //          time_xem=?
  //      WHERE id = ?`,
  //     [time_start, time_end, time_xem, id]
  //   );

  //   return result.affectedRows > 0;
  // },

  updateDotLuong: async (id, dotLuong) => {
    const updateFields = [];
    const updateValues = [];
    const possibleFields = [
      "time_start",
      "time_end",
      "time_xem",
      "time_start_ql",
      "time_end_ql",
      "is_Active",
    ];

    possibleFields.forEach((field) => {
      if (dotLuong[field] !== undefined && dotLuong[field] !== null) {
        updateFields.push(`${field} = ?`);
        if (field === "time_xem") {
          // Xử lý đặc biệt cho time_xem (chỉ thời gian)
          const timeValue = moment(
            dotLuong[field],
            ["HH:mm:ss", "HH:mm"],
            true
          );
          if (timeValue.isValid()) {
            updateValues.push(timeValue.format("HH:mm:ss"));
          } else {
            throw new Error(
              `Invalid time format for time_xem: ${dotLuong[field]}`
            );
          }
        } else {
          // Chuyển đổi định dạng datetime cho các trường khác
          const dateValue = moment(
            dotLuong[field],
            [moment.ISO_8601, "YYYY/MM/DD HH:mm:ss", "YYYY-MM-DD HH:mm:ss"],
            true
          );
          if (dateValue.isValid()) {
            updateValues.push(dateValue.format("YYYY-MM-DD HH:mm:ss"));
          } else {
            throw new Error(
              `Invalid date format for ${field}: ${dotLuong[field]}`
            );
          }
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `UPDATE pm_luong_dot SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    updateValues.push(id);

    const [result] = await db.query(query, updateValues);

    return result.affectedRows > 0;
  },

  updateIsActive: async (dotLuongUpdates) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction
      for (const update of dotLuongUpdates) {
        const { id, is_Active } = update; // Lấy ID và giá trị mới cho is_Active

        await connection.query(
          `UPDATE pm_luong_dot
           SET is_Active = ?
           WHERE id = ?`,
          [is_Active, id]
        );
      }

      await connection.commit(); // Commit transaction
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  deleteDotLuong: async (id) => {
    await db.query("DELETE FROM pm_luong_dot WHERE id = ?", [id]);
  },
};

module.exports = DotLuong;
