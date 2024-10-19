// models/userModel.js
const db = require("../config/db");
const moment = require("moment");

const StatusLuong = {
  getAllStatusLuongs: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_status_luong");
    return rows;
  },

  getStatusLuongById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id = ?",
      [numericId]
    );
    return rows[0];
  },

  getStatusLuongByStatusDone: async (dotId) => {
    const [rows] = await db.query(
      `SELECT DISTINCT sl.*
       FROM pm_luong_status_luong sl
       JOIN pm_luong_dot d ON d.id = sl.id_dot
       WHERE d.id = ? AND sl.id_dot = d.id AND sl.tinh_trang = 'Đã xác nhận'`,
      [dotId]
    );
    return rows;
  },

  getStatusLuongByStatusNoUpdateData: async (dotId) => {
    const [rows] = await db.query(
      `SELECT DISTINCT sl.*
       FROM pm_luong_status_luong sl
       JOIN pm_luong_dot d ON d.id = sl.id_dot
       WHERE d.id = ? AND sl.id_dot = d.id 
       AND sl.tinh_trang_ns_khieu_nai = 'Dữ liệu đúng không cập nhật'`,
      [dotId]
    );
    return rows;
  },

  getStatusLuongByStatusUpdateData: async (dotId) => {
    const [rows] = await db.query(
      `SELECT DISTINCT sl.*
       FROM pm_luong_status_luong sl
       JOIN pm_luong_dot d ON d.id = sl.id_dot
       WHERE d.id = ? AND sl.id_dot = d.id 
       AND sl.tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu'`,
      [dotId]
    );
    return rows;
  },

  getStatusLuongByStatusComplaints: async (dotId) => {
    const [rows] = await db.query(
      `SELECT DISTINCT sl.*
       FROM pm_luong_status_luong sl
       JOIN pm_luong_dot d ON d.id = sl.id_dot
       WHERE d.id = ? AND sl.id_dot = d.id
        AND sl.tinh_trang = 'Câu hỏi'
        `,
      [dotId]
    );
    return rows;
  },

  // Thêm nhiều cùng 1 lúc
  createStatusLuong: async (StatusLuongArray) => {
    if (!Array.isArray(StatusLuongArray)) {
      throw new Error("StatusLuongArray phải là một mảng");
    }

    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction
      for (const StatusLuong of StatusLuongArray) {
        const {
          id_trong,
          id_ngoai,
          id_dot,
          time_con_lai,
          tinh_trang,
          noi_dung_kn,
          tinh_trang_ns_khieu_nai,
          tinh_trang_nld_khieu_nai,
          nguoi_nhap,
          ly_do,
          create_time,
          xin_gia_han,
        } = StatusLuong;

        await connection.query(
          `INSERT INTO pm_luong_status_luong (
              id_trong,
              id_ngoai,
              id_dot,
              time_con_lai,
              tinh_trang,
                noi_dung_kn,
              tinh_trang_ns_khieu_nai,
              tinh_trang_nld_khieu_nai,
              nguoi_nhap,
              ly_do,
              create_time,
              xin_gia_han
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1 )`,
          [
            id_trong,
            id_ngoai,
            id_dot,
            time_con_lai,
            tinh_trang,
            noi_dung_kn,
            tinh_trang_ns_khieu_nai,
            tinh_trang_nld_khieu_nai,
            nguoi_nhap,
            ly_do,
            create_time,
            xin_gia_han,
          ]
        );
      }

      await connection.commit(); // Commit transaction
      // return newStatusLuongIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  createStatusLuongTonTaiOLD: async (StatusLuongArray) => {
    if (!Array.isArray(StatusLuongArray)) {
      throw new Error("StatusLuongArray phải là một mảng");
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const StatusLuong of StatusLuongArray) {
        const {
          id_trong,
          id_ngoai,
          id_dot,
          time_con_lai,
          tinh_trang,
          noi_dung_kn,
          tinh_trang_ns_khieu_nai,
          tinh_trang_nld_khieu_nai,
          last_modified,
          nguoi_nhap,
          ly_do,
          create_time,
        } = StatusLuong;

        // Chuyển đổi last_modified thành định dạng MySQL datetime
        const formattedLastModified = moment(last_modified).format(
          "YYYY-MM-DD HH:mm:ss"
        );

        // Kiểm tra xem status đã tồn tại chưa dựa trên id_dot và id_trong hoặc id_ngoai
        const [existingStatus] = await connection.query(
          `SELECT * FROM pm_luong_status_luong 
           WHERE id_dot = ? AND (id_trong = ? OR id_ngoai = ?)`,
          [id_dot, id_trong, id_ngoai]
        );

        if (existingStatus.length === 0) {
          // Nếu chưa tồn tại, thêm mới
          const [result] = await connection.query(
            `INSERT INTO pm_luong_status_luong (
              id_trong, id_ngoai, id_dot, time_con_lai, tinh_trang, noi_dung_kn, tinh_trang_ns_khieu_nai,tinh_trang_nld_khieu_nai, last_modified, nguoi_nhap, ly_do, create_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id_trong,
              id_ngoai,
              id_dot,
              time_con_lai,
              tinh_trang,
              noi_dung_kn,
              tinh_trang_ns_khieu_nai,
              tinh_trang_nld_khieu_nai,
              formattedLastModified,
              nguoi_nhap,
              ly_do,
              create_time,
            ]
          );
        } else {
          // Nếu đã tồn tại, cập nhật
          const [result] = await connection.query(
            `UPDATE pm_luong_status_luong SET
              id_trong = ?,
              id_ngoai = ?,
              time_con_lai = ?,
              tinh_trang = ?,
              noi_dung_kn = ?,
              tinh_trang_ns_khieu_nai = ?,
              tinh_trang_nld_khieu_nai = ?,
              last_modified = ?,
              nguoi_nhap = ?,
              ly_do = ?,
              create_time = ?
            WHERE id_dot = ? AND (id_trong = ? OR id_ngoai = ?)`,
            [
              id_trong,
              id_ngoai,
              time_con_lai,
              tinh_trang,
              noi_dung_kn,
              tinh_trang_ns_khieu_nai,
              tinh_trang_nld_khieu_nai,
              formattedLastModified,
              nguoi_nhap,
              ly_do,
              create_time,
              id_dot,
              id_trong,
              id_ngoai,
            ]
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Error in createStatusLuongTonTai:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  createStatusLuongTonTai: async (StatusLuongArray) => {
    if (!Array.isArray(StatusLuongArray)) {
      throw new Error("StatusLuongArray phải là một mảng");
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const StatusLuong of StatusLuongArray) {
        const {
          id_trong,
          id_ngoai,
          id_dot,
          time_con_lai,
          tinh_trang,
          noi_dung_kn,
          tinh_trang_ns_khieu_nai,
          tinh_trang_nld_khieu_nai,
          last_modified,
          nguoi_nhap,
          ly_do,
          create_time,
          xin_gia_han,
        } = StatusLuong;

        // Chuyển đổi last_modified thành định dạng MySQL datetime
        const formattedLastModified = moment(last_modified).format(
          "YYYY-MM-DD HH:mm:ss"
        );

        // Chuyển đổi create_time thành định dạng MySQL datetime
        const formattedCreateTime = moment(create_time).format(
          "YYYY-MM-DD HH:mm:ss"
        );

        // Kiểm tra xem status đã tồn tại chưa
        const [existingStatus] = await connection.query(
          `SELECT * FROM pm_luong_status_luong 
           WHERE id_dot = ? AND (id_trong = ? OR id_ngoai = ?)`,
          [id_dot, id_trong, id_ngoai]
        );

        if (existingStatus.length === 0) {
          // Nếu chưa tồn tại, thêm mới (giữ nguyên như cũ)
          await connection.query(
            `INSERT INTO pm_luong_status_luong (
              id_trong, id_ngoai, id_dot, time_con_lai, tinh_trang, noi_dung_kn, tinh_trang_ns_khieu_nai, tinh_trang_nld_khieu_nai, last_modified, nguoi_nhap, ly_do, create_time, xin_gia_han
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              id_trong,
              id_ngoai,
              id_dot,
              time_con_lai,
              tinh_trang,
              noi_dung_kn,
              tinh_trang_ns_khieu_nai,
              tinh_trang_nld_khieu_nai,
              formattedLastModified,
              nguoi_nhap,
              ly_do,
              formattedCreateTime,
              xin_gia_han,
            ]
          );
        } else {
          // Nếu đã tồn tại, chỉ cập nhật các trường được truyền vào
          let updateQuery = "UPDATE pm_luong_status_luong SET ";
          const updateValues = [];
          const updateFields = [];

          if (time_con_lai !== undefined) {
            updateFields.push("time_con_lai = ?");
            updateValues.push(time_con_lai);
          }
          if (tinh_trang !== undefined) {
            updateFields.push("tinh_trang = ?");
            updateValues.push(tinh_trang);
          }
          if (noi_dung_kn !== undefined) {
            updateFields.push("noi_dung_kn = ?");
            updateValues.push(noi_dung_kn);
          }
          if (tinh_trang_ns_khieu_nai !== undefined) {
            updateFields.push("tinh_trang_ns_khieu_nai = ?");
            updateValues.push(tinh_trang_ns_khieu_nai);
          }
          if (tinh_trang_nld_khieu_nai !== undefined) {
            updateFields.push("tinh_trang_nld_khieu_nai = ?");
            updateValues.push(tinh_trang_nld_khieu_nai);
          }
          if (last_modified !== undefined) {
            updateFields.push("last_modified = ?");
            updateValues.push(formattedLastModified);
          }
          if (nguoi_nhap !== undefined) {
            updateFields.push("nguoi_nhap = ?");
            updateValues.push(nguoi_nhap);
          }
          if (ly_do !== undefined) {
            updateFields.push("ly_do = ?");
            updateValues.push(ly_do);
          }
          if (create_time !== undefined) {
            updateFields.push("create_time = ?");
            updateValues.push(formattedCreateTime);
          }
          if (xin_gia_han !== undefined) {
            updateFields.push("xin_gia_han = ?");
            updateValues.push(xin_gia_han);
          }

          if (updateFields.length > 0) {
            updateQuery += updateFields.join(", ");
            updateQuery +=
              " WHERE id_dot = ? AND (id_trong = ? OR id_ngoai = ?)";
            updateValues.push(id_dot, id_trong, id_ngoai);

            await connection.query(updateQuery, updateValues);
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Error in createStatusLuongTonTai:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  getStatusLuongOutPage: async (id_dot, id_trong) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id_dot = ? and id_trong = ? and tinh_trang = 'Tắt trang'",
      [id_dot, id_trong]
    );
    return rows;
  },

  getStatusLuongOutPageCN: async (id_dot, id_ngoai) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id_dot = ? and id_ngoai = ? and tinh_trang = 'Tắt trang'",
      [id_dot, id_ngoai]
    );
    return rows;
  },

  getStatusLuongComplaints: async (id_dot, id_trong) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id_dot = ? and id_trong = ? and tinh_trang = 'Câu hỏi' AND tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu'",
      [id_dot, id_trong]
    );
    return rows;
  },

  getStatusLuongComplaintsCN: async (id_dot, id_ngoai) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id_dot = ? and id_ngoai = ? and tinh_trang = 'Câu hỏi' AND tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu'",
      [id_dot, id_ngoai]
    );
    return rows;
  },

  updateStatusLuong: async (id, user) => {
    const updateFields = [];
    const updateValues = [];
    const possibleFields = [
      "id_trong",
      "id_ngoai",
      "id_dot",
      "time_con_lai",
      "tinh_trang",
      "noi_dung_kn",
      "tinh_trang_ns_khieu_nai", // Thêm trường tinh_trang_ns_khieu_nai
      "tinh_trang_nld_khieu_nai", // Thêm trường tinh_trang_nld_khieu_nai
      "nguoi_nhap",
      "ly_do",
      "create_time",
      "xin_gia_han",
    ];

    let hasUpdates = false;

    possibleFields.forEach((field) => {
      if (user[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === "time_con_lai") {
          updateValues.push(
            user[field]
              ? moment(user[field]).format("YYYY-MM-DD HH:mm:ss")
              : null
          );
        } else {
          updateValues.push(user[field]);
        }
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      // Tự động thêm last_modified
      updateFields.push("last_modified = ?");
      updateValues.push(moment().format("YYYY-MM-DD HH:mm:ss"));
    } else {
      throw new Error("No fields to update");
    }

    const query = `UPDATE pm_luong_status_luong SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    updateValues.push(id);

    const [result] = await db.query(query, updateValues);

    return result.affectedRows > 0;
  },

  getStatusByIdTrongAndIdDot: async (id_trong, id_dot, id) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_luong_status_luong WHERE id_dot = ? and (id_trong = ? or id_ngoai = ?)",
      [id_dot, id_trong, id_trong]
    );
    return rows[0];
  },
  updateStatusLuongXinGiaHan: async (idTrongOrNgoai, id_dot, xin_gia_han) => {
    const query = `
      UPDATE pm_luong_status_luong 
      SET xin_gia_han = ?, last_modified = ? 
      WHERE (id_trong = ? OR id_ngoai = ?) AND id_dot = ?
    `;
    const updateValues = [
      xin_gia_han,
      moment().format("YYYY-MM-DD HH:mm:ss"),
      idTrongOrNgoai,
      idTrongOrNgoai,
      id_dot,
    ];

    try {
      const [result] = await db.query(query, updateValues);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating xin_gia_han status:", error);
      throw error;
    }
  },

  // Thêm hàm này vào model StatusLuong
  getExtensionStatus: async (id_trong_ngoai, id_dot) => {
    const query = `SELECT xin_gia_han FROM pm_luong_status_luong WHERE (id_trong = ? OR id_ngoai = ?) AND id_dot = ?`;
    try {
      const [rows] = await db.query(query, [
        id_trong_ngoai,
        id_trong_ngoai,
        id_dot,
      ]);
      return rows.length > 0 ? rows[0].xin_gia_han : null;
    } catch (error) {
      console.error("Error fetching extension status:", error);
      throw error;
    }
  },

  deleteStatusLuong: async (id) => {
    await db.query("DELETE FROM pm_luong_status_luong WHERE id = ?", [id]);
  },
};

module.exports = StatusLuong;
