// models/userModel.js
const db = require("../config/db");

const ChiNgoai = {
  getAllChiNgoais: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_chi_ngoai");
    return rows;
  },

  getChiNgoaiById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_ngoai WHERE id = ?",
      [numericId]
    );
    return rows[0];
  },

  getChiNgoaiByIdDot: async (id_dot) => {
    const [dot] = await db.query(
      "SELECT is_Active FROM pm_luong_dot WHERE id = ?",
      [id_dot]
    );

    // Kiểm tra nếu is_Active là false
    if (dot.length === 0 || dot[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt lương không hoạt động.");
    }
    // Chuyển đổi Ma_nv từ chuỗi thành số nguyên
    const numericIdDot = id_dot;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericIdDot)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_ngoai WHERE id_dot = ?",
      [numericIdDot]
    );
    return rows;
  },

  getChiNgoaiByMaMV: async (ma_nv) => {
    // Chuyển đổi Ma_nv từ chuỗi thành số nguyên
    const numericMa_nv = ma_nv;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericMa_nv)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_ngoai WHERE ma_nv = ?",
      [numericMa_nv]
    );
    return rows[0];
  },

  createChiNgoai: async (chiNgoaiArray, dotLuongId) => {
    if (!Array.isArray(chiNgoaiArray)) {
      throw new Error("chiNgoaiArray phải là một mảng");
    }

    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      // Chèn bản ghi vào bảng pm_luong_chi_ngoai
      for (const user of chiNgoaiArray) {
        const {
          ma_nv,
          ho_ten,
          lam_them_nt,
          lam_them_nn,
          gio_cong_lam_them_nt,
          gio_cong_lam_them_nn,
          phu_cap_dem,
          thuong_ksnx_ngay_thuong,
          tien_xe,
          tien_an,
          bo_sung_so_cho_tien_mat,
          cac_khoan_khac,
          tong_cong,
          last_modified,
        } = user;

        await connection.query(
          `INSERT INTO pm_luong_chi_ngoai (
            ma_nv,
            ho_ten,
            lam_them_nt,
            lam_them_nn,
            gio_cong_lam_them_nt,
            gio_cong_lam_them_nn,
            phu_cap_dem,
            thuong_ksnx_ngay_thuong,
            tien_xe,
            tien_an,
            bo_sung_so_cho_tien_mat,
            cac_khoan_khac,
            tong_cong,
            last_modified,
            id_dot
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ma_nv,
            ho_ten,
            lam_them_nt,
            lam_them_nn,
            gio_cong_lam_them_nt,
            gio_cong_lam_them_nn,
            phu_cap_dem,
            thuong_ksnx_ngay_thuong,
            tien_xe,
            tien_an,
            bo_sung_so_cho_tien_mat,
            cac_khoan_khac,
            tong_cong,
            last_modified,
            dotLuongId,
          ]
        );
      }

      await connection.commit(); // Commit transaction nếu tất cả thành công
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  updateTrangThai: async (id, trangThai) => {
    const [result] = await db.query(
      "UPDATE pm_luong_chi_ngoai SET trang_thai = ? WHERE id = ?",
      [trangThai, id]
    );
    return result.affectedRows > 0;
  },

  updateToCreateChiNgoai: async (data, id_dot) => {
    const [rows] = await db.query(
      "SELECT is_Active FROM pm_luong_dot WHERE id = ?",
      [id_dot]
    );

    // Kiểm tra nếu is_Active là false
    if (rows.length === 0 || rows[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt lương không hoạt động.");
    }
    const dataWithIdDot = id_dot.data.map((item) => ({ ...item }));
    const fields = [
      "ho_ten",
      "ma_nv",
      "lam_them_nt",
      "lam_them_nn",
      "gio_cong_lam_them_nt",
      "gio_cong_lam_them_nn",
      "phu_cap_dem",
      "thuong_ksnx_ngay_thuong",
      "tien_xe",
      "tien_an",
      "bo_sung_so_cho_tien_mat",
      "cac_khoan_khac",
      "tong_cong",
      "id_dot",
    ];

    const placeholders = fields.map(() => "?").join(", ");
    const updateClauses = fields
      .filter((field) => field !== "ma_nv")
      .map((field) => `${field} = VALUES(${field})`)
      .join(", ");

    const values = dataWithIdDot
      .map((item) =>
        fields.map((field) => (item[field] !== undefined ? item[field] : 0))
      )
      .flat();

    const sql = `
      INSERT INTO pm_luong_chi_ngoai
      (${fields.join(", ")})
      VALUES ${dataWithIdDot.map(() => `(${placeholders})`).join(", ")}
      ON DUPLICATE KEY UPDATE
      ${updateClauses}
    `;

    try {
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      throw error;
    }
  },

  updateChiNgoaiNolast_modified: async (data, id_dot) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Bước 1: Tạo bảng tạm và chèn dữ liệu hiện có
      await connection.query(
        `
        CREATE TABLE temp_chi_ngoainew AS
        SELECT * FROM pm_luong_chi_ngoai
        WHERE id_dot = ?
      `,
        [id_dot.id_dot]
      );

      // Thêm khóa chính cho bảng tạm
      await connection.query(`
        ALTER TABLE temp_chi_ngoainew
        ADD PRIMARY KEY (id)
      `);

      // Hàm để xử lý chuỗi số có dấu phẩy
      const processNumericString = (value) => {
        if (value === null || value === undefined || value === "") {
          return 0;
        }
        if (typeof value === "string") {
          return parseFloat(value.replace(/,/g, "")) || 0;
        }
        return typeof value === "number" ? value : 0;
      };

      // Bước 2: Cập nhật bảng tạm với dữ liệu mới từ frontend
      const updatePromises = id_dot.data.map((item) => {
        const sql = `
          UPDATE temp_chi_ngoainew
          SET
            ho_ten = ?,
            lam_them_nt = ?,
            lam_them_nn = ?,
            gio_cong_lam_them_nt = ?,
            gio_cong_lam_them_nn = ?,
            phu_cap_dem = ?,
            thuong_ksnx_ngay_thuong = ?,
            tien_xe = ?,
            tien_an = ?,
            bo_sung_so_cho_tien_mat = ?,
            cac_khoan_khac = ?,
            tong_cong = ?
            last_modified = CURRENT_TIMESTAMP
          WHERE ma_nv = ? AND id_dot = ?
        `;
        const values = [
          item.ho_ten,
          processNumericString(item.lam_them_nt),
          processNumericString(item.lam_them_nn),
          processNumericString(item.gio_cong_lam_them_nt),
          processNumericString(item.gio_cong_lam_them_nn),
          processNumericString(item.phu_cap_dem),
          processNumericString(item.thuong_ksnx_ngay_thuong),
          processNumericString(item.tien_xe),
          processNumericString(item.tien_an),
          processNumericString(item.bo_sung_so_cho_tien_mat),
          processNumericString(item.cac_khoan_khac),
          processNumericString(item.tong_cong),
          item.ma_nv,
          id_dot.id_dot,
        ];

        return connection.query(sql, values);
      });

      await Promise.all(updatePromises);

      // Bước 3: Cập nhật bảng chính từ bảng tạm sử dụng INSERT ... ON DUPLICATE KEY UPDATE
      const result = await connection.query(`
        INSERT INTO pm_luong_chi_ngoai (
          id, ma_nv, ho_ten, lam_them_nt, lam_them_nn,
          gio_cong_lam_them_nt, gio_cong_lam_them_nn, phu_cap_dem,
          thuong_ksnx_ngay_thuong, tien_xe, tien_an,
          bo_sung_so_cho_tien_mat, cac_khoan_khac, tong_cong
        )
        SELECT
          id, ma_nv, ho_ten, lam_them_nt, lam_them_nn,
          gio_cong_lam_them_nt, gio_cong_lam_them_nn, phu_cap_dem,
          thuong_ksnx_ngay_thuong, tien_xe, tien_an,
          bo_sung_so_cho_tien_mat, cac_khoan_khac, tong_cong
        FROM temp_chi_ngoainew
        ON DUPLICATE KEY UPDATE
          ma_nv = VALUES(ma_nv),
          ho_ten = VALUES(ho_ten),
          lam_them_nt = VALUES(lam_them_nt),
          lam_them_nn = VALUES(lam_them_nn),
          gio_cong_lam_them_nt = VALUES(gio_cong_lam_them_nt),
          gio_cong_lam_them_nn = VALUES(gio_cong_lam_them_nn),
          phu_cap_dem = VALUES(phu_cap_dem),
          thuong_ksnx_ngay_thuong = VALUES(thuong_ksnx_ngay_thuong),
          tien_xe = VALUES(tien_xe),
          tien_an = VALUES(tien_an),
          bo_sung_so_cho_tien_mat = VALUES(bo_sung_so_cho_tien_mat),
          cac_khoan_khac = VALUES(cac_khoan_khac),
          tong_cong = VALUES(tong_cong)
      `);
      // console.log(JSON.stringify(result, null, 2));
      // Bước 4: Xóa bảng tạm
      await connection.query("DROP TABLE temp_chi_ngoainew");
      // const [rows] = await connection.query("SELECT * FROM temp_chi_ngoainew");

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  updateChiNgoai: async (data, id_dot) => {
    const [rows] = await db.query(
      "SELECT is_Active FROM pm_luong_dot WHERE id = ?",
      [id_dot]
    );

    // Kiểm tra nếu is_Active là false
    if (rows.length === 0 || rows[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt lương không hoạt động.");
    }
    const connection = await db.getConnection();
    try {
      // Bước 1: Tạo bảng tạm và chèn dữ liệu hiện có
      await connection.query(
        `
        CREATE TABLE temp_chi_ngoainew AS
        SELECT * FROM pm_luong_chi_ngoai
        WHERE id_dot = ?
      `,
        [id_dot.id_dot]
      );

      // Thêm khóa chính cho bảng tạm
      await connection.query(`
        ALTER TABLE temp_chi_ngoainew
        ADD PRIMARY KEY (id)
      `);

      // Hàm để xử lý chuỗi số có dấu phẩy
      const processNumericString = (value) => {
        if (value === null || value === undefined || value === "") {
          return null;
        }
        if (typeof value === "string") {
          return parseFloat(value.replace(/,/g, "")) || null;
        }
        return typeof value === "number" ? value : null;
      };

      // Hàm để so sánh giá trị cũ và mới
      const hasChanged = (oldValue, newValue) => {
        const processedNewValue = processNumericString(newValue);
        return oldValue !== processedNewValue && processedNewValue !== null;
      };

      // Bước 2: Cập nhật bảng tạm với dữ liệu mới từ frontend
      const updatePromises = id_dot.data.map(async (item) => {
        // Lấy dữ liệu hiện tại từ bảng tạm
        const [currentData] = await connection.query(
          "SELECT * FROM temp_chi_ngoainew WHERE ma_nv = ? AND id_dot = ?",
          [item.ma_nv, id_dot.id_dot]
        );

        if (currentData.length === 0) return; // Bỏ qua nếu không tìm thấy bản ghi

        const currentItem = currentData[0];
        const updates = [];
        const values = [];

        const fieldMapping = {
          khac: "cac_khoan_khac",
          // thêm các ánh xạ khác nếu cần
        };

        // Kiểm tra từng trường và chỉ cập nhật những trường đã thay đổi
        Object.keys(item).forEach((key) => {
          const dbField = fieldMapping[key] || key;
          if (
            dbField !== "ma_nv" &&
            dbField !== "id_dot" &&
            hasChanged(currentItem[dbField], item[key])
          ) {
            updates.push(`${dbField} = ?`);
            values.push(processNumericString(item[key]));
          }
        });

        if (updates.length === 0) return; // Không có gì thay đổi

        updates.push("last_modified = CURRENT_TIMESTAMP");

        const sql = `
          UPDATE temp_chi_ngoainew
          SET ${updates.join(", ")}
          WHERE ma_nv = ? AND id_dot = ?
        `;
        values.push(item.ma_nv, id_dot.id_dot);

        return connection.query(sql, values);
      });

      await Promise.all(updatePromises.filter(Boolean));

      // Lấy thời gian cập nhật mới nhất
      const [lastModifiedResult] = await connection.query(
        "SELECT MAX(last_modified) as last_update FROM temp_chi_ngoainew WHERE id_dot = ?",
        [id_dot.id_dot]
      );

      // Bước 3: Cập nhật bảng chính từ bảng tạm
      await connection.query(`
        INSERT INTO pm_luong_chi_ngoai
        SELECT * FROM temp_chi_ngoainew
        ON DUPLICATE KEY UPDATE
        ho_ten = VALUES(ho_ten),
        lam_them_nt = VALUES(lam_them_nt),
        lam_them_nn = VALUES(lam_them_nn),
        gio_cong_lam_them_nt = VALUES(gio_cong_lam_them_nt),
        gio_cong_lam_them_nn = VALUES(gio_cong_lam_them_nn),
        phu_cap_dem = VALUES(phu_cap_dem),
        thuong_ksnx_ngay_thuong = VALUES(thuong_ksnx_ngay_thuong),
        tien_xe = VALUES(tien_xe),
        tien_an = VALUES(tien_an),
        bo_sung_so_cho_tien_mat = VALUES(bo_sung_so_cho_tien_mat),
        cac_khoan_khac = VALUES(cac_khoan_khac),
        tong_cong = VALUES(tong_cong),
        last_modified = VALUES(last_modified)
      `);

      // Bước 4: Xóa bảng tạm
      await connection.query("DROP TABLE temp_chi_ngoainew");

      await connection.commit();
      return {
        success: true,
        lastModified: lastModifiedResult[0].last_update,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  updateChiNgoaiArray: async (data, id_dot) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Bước 1: Lấy dữ liệu hiện có từ cơ sở dữ liệu
      const [existingData] = await connection.query(
        "SELECT * FROM pm_luong_chi_ngoai WHERE id_dot = ?",
        [id_dot.data[0].id_dot]
      );

      // Bước 2: Tạo một Map để dễ dàng tìm kiếm dữ liệu hiện có
      const existingDataMap = new Map(
        existingData.map((item) => [`${item.ma_nv}_${item.id_dot}`, item])
      );

      // Bước 3: Kết hợp dữ liệu hiện có với dữ liệu mới
      const updatedData = id_dot.data.map((newItem) => {
        const key = `${newItem.ma_nv}_${id_dot.data[0].id_dot}`;
        const existingItem = existingDataMap.get(key);
        if (existingItem) {
          return {
            ...existingItem,
            ...newItem,
            id_dot: id_dot.data[0].id_dot,
          };
        } else {
          return {
            ...newItem,
            id_dot: id_dot.data[0].id_dot,
          };
        }
      });

      // Bước 4: Cập nhật hoặc chèn dữ liệu
      const updatePromises = updatedData.map((item) => {
        const sql = `
          INSERT INTO pm_luong_chi_ngoai
          (id, ma_nv, id_dot, ho_ten, lam_them_nt, lam_them_nn, 
          gio_cong_lam_them_nt, gio_cong_lam_them_nn, phu_cap_dem, 
          thuong_ksnx_ngay_thuong, tien_xe, tien_an, 
          bo_sung_so_cho_tien_mat, cac_khoan_khac, tong_cong)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          ho_ten = VALUES(ho_ten),
          lam_them_nt = VALUES(lam_them_nt),
          lam_them_nn = VALUES(lam_them_nn),
          gio_cong_lam_them_nt = VALUES(gio_cong_lam_them_nt),
          gio_cong_lam_them_nn = VALUES(gio_cong_lam_them_nn),
          phu_cap_dem = VALUES(phu_cap_dem),
          thuong_ksnx_ngay_thuong = VALUES(thuong_ksnx_ngay_thuong),
          tien_xe = VALUES(tien_xe),
          tien_an = VALUES(tien_an),
          bo_sung_so_cho_tien_mat = VALUES(bo_sung_so_cho_tien_mat),
          cac_khoan_khac = VALUES(cac_khoan_khac),
          tong_cong = VALUES(tong_cong)
        `;
        const values = [
          item.id,
          item.ma_nv,
          item.id_dot,
          item.ho_ten,
          item.lam_them_nt,
          item.lam_them_nn,
          item.gio_cong_lam_them_nt,
          item.gio_cong_lam_them_nn,
          item.phu_cap_dem,
          item.thuong_ksnx_ngay_thuong,
          item.tien_xe,
          item.tien_an,
          item.bo_sung_so_cho_tien_mat,
          item.cac_khoan_khac,
          item.tong_cong,
        ];
        return connection.query(sql, values);
      });

      const results = await Promise.all(updatePromises);

      console.log("Kết quả cập nhật:");
      console.log(JSON.stringify(results, null, 2));

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // getActiveChiNgoaiForEmployee: async (maNV) => {
  //   const [rows] = await db.query(
  //     `
  //     SELECT cn.*,d.bang_luong_t
  //     FROM pm_luong_dot as d,
  //     pm_luong_chi_ngoai as cn
  //     LEFT JOIN pm_luong_status_luong as sl
  //     ON sl.id_ngoai = cn.id

  //     WHERE d.id = cn.id_dot
  //     AND cn.ma_nv = ?
  //     AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') >= d.time_start
  //     AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') <= d.time_end
  //     AND ((sl.tinh_trang NOT IN ('Đã xác nhận','Hết giờ','Câu hỏi') OR sl.tinh_trang IS NULL) OR (sl.tinh_trang = 'Câu hỏi' AND sl.tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu'))
  //   `,
  //     [maNV]
  //   );
  //   return rows;
  // },

  getActiveChiNgoaiForEmployee: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT av.time_start, av.time_end, pb.id as pb_id, bp.id as bp_id, cn.*, d.bang_luong_t
        FROM sync_data_hi_time_sheet.sync_nhan_vien nv
        inner join pm_bo_phan_quan_ly_new bp_new 
          ON nv.id_bo_phan = bp_new.id_bo_phan and nv.ma_nv = ?
        inner JOIN sync_data_hi_time_sheet.sync_bo_phan bp
          ON bp_new.id_bo_phan = bp.id
        inner JOIN pm_phong_ban_quan_ly_new pb 
          ON bp.id_phong_ban = pb.id
        inner JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew
          ON pbnew.id = pb.id_phong_ban
        inner JOIN pm_luong_dot_phong_ban_time_allow_view av
          ON av.id_phong_ban = pb.id and CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') >= av.time_start
          AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') <= av.time_end
        inner join pm_luong_dot AS d
        ON d.id = av.id_dot
        inner JOIN pm_luong_chi_ngoai AS cn
        ON d.id = cn.id_dot and cn.ma_nv = nv.ma_nv
        left JOIN pm_luong_status_luong AS sl
          ON sl.id_ngoai = cn.id
        WHERE (sl.tinh_trang NOT IN ('Đã xác nhận', 'Hết giờ', 'Câu hỏi') OR sl.tinh_trang IS NULL)
        OR (sl.tinh_trang = 'Câu hỏi' AND sl.tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu')`,
      [maNV]
    );
    return rows;
  },

  getActiveChiNgoaiForEmployeeQL: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT cn.*,d.bang_luong_t
      FROM pm_luong_dot as d,
      pm_luong_chi_ngoai as cn
      LEFT JOIN pm_luong_status_luong as sl
      ON sl.id_ngoai = cn.id

      WHERE d.id = cn.id_dot
      AND cn.ma_nv = ?
      AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') >= d.time_start_ql
      AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') <= d.time_end_ql
    `,
      [maNV]
    );
    return rows;
  },

  getActiveChiNgoaiForEmployeeSP: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT cn.*,d.bang_luong_t
      FROM pm_luong_dot as d,
      pm_luong_chi_ngoai as cn
      LEFT JOIN pm_luong_status_luong as sl
      ON sl.id_ngoai = cn.id

      WHERE d.id = cn.id_dot
      AND cn.ma_nv = ?
    `,
      [maNV]
    );
    return rows;
  },

  deleteChiNgoai: async (id) => {
    await db.query("DELETE FROM pm_luong_chi_ngoai WHERE id = ?", [id]);
  },
};

module.exports = ChiNgoai;
