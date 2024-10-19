// models/userModel.js
const db = require("../config/db");

const NhanVien = {
  getAllNhanViens: async () => {
    const [rows] = await db.query(
      "SELECT nv.*, bp.ten_bo_phan FROM sync_data_hi_time_sheet.sync_nhan_vien nv, pm_bo_phan_quan_ly_new bp_new, sync_data_hi_time_sheet.sync_bo_phan bp WHERE nv.id_bo_phan = bp_new.id_bo_phan and bp_new.id_bo_phan = bp.id"
    );
    // console.log(rows);
    return rows;
  },

  // Thêm phương thức mới để lấy danh sách nhân viên có phân trang
  getAllNhanViensPaginated: async (page, limit) => {
    const offset = (page - 1) * limit;

    try {
      // Lấy tổng số nhân viên
      const [countResult] = await db.query(
        "SELECT COUNT(*) as total FROM sync_data_hi_time_sheet.sync_nhan_vien"
      );
      const totalItems = countResult[0].total;

      // Lấy danh sách nhân viên với phân trang
      const [rows] = await db.query(
        `SELECT nv.*, bp.ten_bo_phan 
       FROM sync_data_hi_time_sheet.sync_nhan_vien nv 
       LEFT JOIN pm_bo_phan_quan_ly_new bp_new ON nv.id_bo_phan = bp_new.id_bo_phan
       LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_new.id = bp.id
       LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const totalPages = Math.ceil(totalItems / limit);

      return {
        nhanViens: rows,
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      };
    } catch (error) {
      console.error("Error in getAllNhanViensPaginated:", error);
      throw error;
    }
  },

  getAllNhanVienByLimit: async (page, limit, searchTerm = "") => {
    const offset = (page - 1) * limit;

    try {
      let queryCount = "SELECT COUNT(*) as total FROM sync_data_hi_time_sheet.sync_nhan_vien nv";
      let querySelect = `
        SELECT nv.*, bp.ten_bo_phan 
        FROM sync_data_hi_time_sheet.sync_nhan_vien nv 
        LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON nv.id_bo_phan = bp.id
      `;
      let queryParams = [];

      if (searchTerm) {
        const searchCondition = "WHERE nv.ma_nv LIKE ? OR nv.ten_nv LIKE ?";
        queryCount += " " + searchCondition;
        querySelect += " " + searchCondition;
        queryParams = [`%${searchTerm}%`, `%${searchTerm}%`];
      }

      querySelect += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      // Lấy tổng số nhân viên
      const [totalResult] = await db.query(queryCount, queryParams.slice(0, 2));
      const totalItems = totalResult[0].total;

      // Lấy danh sách nhân viên với phân trang
      const [nhanViens] = await db.query(querySelect, queryParams);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        nhanViens,
        totalPages,
        totalItems,
      };
    } catch (error) {
      console.error("Error in getAllNhanViens model:", error);
      throw error;
    }
  },

  getNhanVienByAdmin: async (ma_nv) => {
    try {
      let query = `
        SELECT DISTINCT * FROM sync_data_hi_time_sheet.sync_nhan_vien WHERE ma_nv = ?
      `;
      let params = [ma_nv];
      const [rows] = await db.query(query, params);
      return rows[0];
    } catch (error) {
      console.log("Error in getNhanVienByAdmin:", error);
      throw error;
    }
  },

  getNhanVienByMaNV: async (ma_nv) => {
    try {
      const [rows] = await db.query(
        "SELECT nv.*, bp.ten_bo_phan FROM sync_data_hi_time_sheet.sync_nhan_vien nv , sync_data_hi_time_sheet.sync_bo_phan bp WHERE nv.id_bo_phan = bp.id AND ma_nv LIKE ?",
        [`${ma_nv}`]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error in getNhanVienByMaNV:", error);
      throw error;
    }
  },

  getNhanVienByMaNVLike: async (ma_nv) => {
    try {
      const [rows] = await db.query(
        "SELECT nv.*, bp.ten_bo_phan FROM sync_data_hi_time_sheet.sync_nhan_vien nv , sync_data_hi_time_sheet.sync_bo_phan bp WHERE nv.id_bo_phan = bp.id AND ma_nv LIKE ?",
        [`${ma_nv}%`]
      );
      return rows || null;
    } catch (error) {
      console.error("Error in getNhanVienByMaNV:", error);
      throw error;
    }
  },

  getNhanVienById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query("SELECT * FROM sync_data_hi_time_sheet.sync_nhan_vien WHERE id = ?", [
      numericId,
    ]);
    return rows[0];
  },

  createNhanVien: async (nhanVienArray) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      const newNhanVienIds = [];
      for (const user of nhanVienArray) {
        const {
          id_SQL,
          an_chay_truong,
          isActived,
          ma_nv,
          mat_khau,
          ncn,
          tt7,
          ten_nv,
          id_bo_phan,
          cccd,
        } = user;

        // Mã hóa mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(mat_khau, 10); // 10 là số lần salt

        const [result] = await connection.query(
          `INSERT INTO sync_data_hi_time_sheet.sync_nhan_vien (
          id_SQL, an_chay_truong, isActived, ma_nv, mat_khau, ncn, tt7, ten_nv, id_bo_phan, cccd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_SQL,
            an_chay_truong,
            isActived,
            ma_nv,
            hashedPassword, // Sử dụng mật khẩu đã mã hóa
            ncn,
            tt7,
            ten_nv,
            id_bo_phan,
            cccd,
          ]
        );

        newNhanVienIds.push(result.insertId);
      }

      await connection.commit(); // Commit transaction nếu tất cả thành công
      return newNhanVienIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  updateNhanVien: async (id, user) => {
    const {
      id_SQL,
      an_chay_truong,
      isActived,
      ma_nv,
      mat_khau,
      ncn,
      tt7,
      ten_nv,
      id_bo_phan,
      cccd,
    } = user;

    const [result] = await db.query(
      `UPDATE sync_data_hi_time_sheet.sync_nhan_vien
       SET id_SQL = ?,
           an_chay_truong = ?,
           isActived=?,
           so_the=?,
           mat_khau=?,
           ncn=?,
           tt7=?,
           ten_nv=?,
           id_bo_phan=?,
           cccd=?,
           last_modified=?
       WHERE id = ?`,
      [
        id_SQL,
        an_chay_truong,
        isActived,
        ma_nv,
        mat_khau,
        ncn,
        tt7,
        ten_nv,
        id_bo_phan,
        cccd,
      ]
    );

    return result.affectedRows > 0;
  },

  // findByMaNV: async (ma_nv) => {
  //   const [rows] = await db.query(
  //     `SELECT nv.* FROM pm_bo_phan_quan_ly_new AS bp, sync_data_hi_time_sheet.sync_nhan_vien AS nv, pm_phong_ban_quan_ly_new AS pb
  //     WHERE nv.ma_nv = ? AND nv.id_bo_phan = bp.id AND bp.id_phong_ban = pb.id`,
  //     [ma_nv]
  //   );
  //   return rows[0];
  // },

  findByMaNV: async (ma_nv) => {
    const [rows] = await db.query(
      `SELECT 
        nv.*, 
        bp.id AS id_bo_phan_lam_viec, 
        pbnew.id AS id_phong_ban_lam_viec,
        bp_phu_trach.id AS id_bo_phan_phu_trach,
        pb_phu_trach_new.id AS id_phong_ban_phu_trach
      FROM 
        sync_data_hi_time_sheet.sync_nhan_vien AS nv
        LEFT JOIN pm_bo_phan_quan_ly_new AS bp_new ON nv.id_bo_phan = bp_new.id_bo_phan
        LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_new.id = bp.id
        LEFT JOIN pm_phong_ban_quan_ly_new AS pb ON bp.id_phong_ban = pb.id
        LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
        LEFT JOIN pm_bo_phan_quan_ly_new AS bp_phu_trach ON bp_phu_trach.phu_trach = nv.ma_nv
        LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp_phu_trach_new ON bp_phu_trach_new.id = bp_phu_trach.id
        LEFT JOIN pm_phong_ban_quan_ly_new AS pb_phu_trach ON pb_phu_trach.phu_trach = nv.ma_nv
        LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pb_phu_trach_new ON pb_phu_trach_new.id = pb_phu_trach.id_phong_ban
      WHERE 
        nv.ma_nv = ?`,
      [ma_nv]
    );
    return rows[0];
  },

  // New method to update login status
  updateLoginStatus: async (ma_nv, isLogin) => {
    try {
      const [result] = await db.query(
        `UPDATE sync_data_hi_time_sheet.sync_nhan_vien
       SET is_login = ?
       WHERE ma_nv = ?`,
        [isLogin, ma_nv]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating login status:", error);
      throw error;
    }
  },

  // New method to check login status
  checkLoginStatus: async (ma_nv) => {
    try {
      const [rows] = await db.query(
        `SELECT is_login FROM sync_data_hi_time_sheet.sync_nhan_vien WHERE ma_nv = ?`,
        [ma_nv]
      );
      if (rows.length > 0) {
        if (Buffer.isBuffer(rows[0].is_login)) {
          return rows[0].is_login.readInt8(0) === 1;
        }
        return rows[0].is_login === true || rows[0].is_login === 1;
      }
      return false;
    } catch (error) {
      console.error("Error checking login status:", error);
      throw error;
    }
  },

  deleteNhanVien: async (id) => {
    await db.query("DELETE FROM sync_data_hi_time_sheet.sync_nhan_vien WHERE id = ?", [id]);
  },
};


module.exports = NhanVien;


