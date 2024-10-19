// models/userModel.js
const db = require("../config/db");

const ChiTrong = {
  getAllChiTrongs: async () => {
    const [rows] = await db.query("SELECT * FROM pm_luong_chi_trong");
    return rows;
  },

  getChiTrongById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_trong WHERE id = ?",
      [numericId]
    );
    return rows[0];
  },

  getChiTrongByIdDot: async (id_dot) => {
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
      throw new Error("Invalid ID Dot");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_trong WHERE id_dot = ?",
      [numericIdDot]
    );
    return rows;
  },

  getChiTrongByMaNV: async (ma_nv) => {
    // Chuyển đổi Ma_nv từ chuỗi thành số nguyên
    const numericMa_nv = ma_nv;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericMa_nv)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_luong_chi_trong WHERE ma_nv = ?",
      [numericMa_nv]
    );
    return rows[0];
  },

  createChiTrong: async (chiTrongArray, dotLuongId) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    const [rows] = await db.query(
      "SELECT is_Active FROM pm_luong_dot WHERE id = ?",
      [dotLuongId]
    );

    // Kiểm tra nếu is_Active là false
    if (rows.length === 0 || rows[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt lương không hoạt động.");
    }
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      for (const chiTrong of chiTrongArray) {
        const {
          ma_nv,
          ho_ten,
          to_in_luong,
          ma_so_thue,
          muc_luong_hd,
          gio_cong_thuc_te,
          gio_cong_T7_CN_CT,
          gio_cong_ngay_thuong,
          gio_cong_nghi,
          gio_cong_phep_thoi_gian,
          gio_cong_huan_luyen,
          luong_tg_phep,
          luong_truc_tiep,
          luong_gian_tiep,
          phu_cap_lam_dem,
          luong_lam_them_ngay_thuong,
          luong_lam_them_ngay_nghi,
          thuong_kpi_san_xuat,
          thuong_cb_nv_gioi,
          phu_cap_kiem_viec,
          phu_cap_con_nho,
          phu_cap_di_lai_xang_xe,
          phu_cap_tien_an,
          thuong_hoan_thanh_kh_thang,
          thuong_hoan_thanh_kh_ngay,
          bo_sung_tron_so_chi_tien_mat,
          cac_khoan_khac,
          tong_cong,
          thue_thu_nhap,
          bao_hiem,
          thu_hoi_phep,
          thuc_lanh,
          last_modified,
        } = chiTrong;

        await connection.query(
          `INSERT INTO pm_luong_chi_trong (
            ma_nv, ho_ten, to_in_luong, ma_so_thue, muc_luong_hd, gio_cong_thuc_te, gio_cong_T7_CN_CT, gio_cong_ngay_thuong, gio_cong_nghi, gio_cong_phep_thoi_gian, gio_cong_huan_luyen, luong_tg_phep, luong_truc_tiep, luong_gian_tiep, phu_cap_lam_dem, luong_lam_them_ngay_thuong, luong_lam_them_ngay_nghi, thuong_kpi_san_xuat, thuong_cb_nv_gioi, phu_cap_kiem_viec, phu_cap_con_nho, phu_cap_di_lai_xang_xe, phu_cap_tien_an, thuong_hoan_thanh_kh_thang, thuong_hoan_thanh_kh_ngay, bo_sung_tron_so_chi_tien_mat, cac_khoan_khac, tong_cong, thue_thu_nhap, bao_hiem, thu_hoi_phep, thuc_lanh, last_modified, id_dot
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ma_nv,
            ho_ten,
            to_in_luong,
            ma_so_thue,
            muc_luong_hd,
            gio_cong_thuc_te,
            gio_cong_T7_CN_CT,
            gio_cong_ngay_thuong,
            gio_cong_nghi,
            gio_cong_phep_thoi_gian,
            gio_cong_huan_luyen,
            luong_tg_phep,
            luong_truc_tiep,
            luong_gian_tiep,
            phu_cap_lam_dem,
            luong_lam_them_ngay_thuong,
            luong_lam_them_ngay_nghi,
            thuong_kpi_san_xuat,
            thuong_cb_nv_gioi,
            phu_cap_kiem_viec,
            phu_cap_con_nho,
            phu_cap_di_lai_xang_xe,
            phu_cap_tien_an,
            thuong_hoan_thanh_kh_thang,
            thuong_hoan_thanh_kh_ngay,
            bo_sung_tron_so_chi_tien_mat,
            cac_khoan_khac,
            tong_cong,
            thue_thu_nhap,
            bao_hiem,
            thu_hoi_phep,
            thuc_lanh,
            last_modified,
            dotLuongId, // Gán ID của đợt lương vào trường id_dot
          ]
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

  getActiveChiTrongForEmployee: async (maNV) => {
    const [rows] = await db.query(
      `
        SELECT av.time_start, av.time_end, pb.id as pb_id, bp.id as bp_id, ct.*, d.bang_luong_t
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
        inner JOIN pm_luong_chi_trong AS ct
        ON d.id = ct.id_dot and ct.ma_nv = nv.ma_nv
        left JOIN pm_luong_status_luong AS sl
          ON sl.id_trong = ct.id
        WHERE (sl.tinh_trang NOT IN ('Đã xác nhận', 'Hết giờ', 'Câu hỏi') OR sl.tinh_trang IS NULL)
        OR (sl.tinh_trang = 'Câu hỏi' AND sl.tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu')
        `,
      //  --------------------- Trước khi khiếu nại ------------------------  -----------------------------------Sau khi khiếu nại--------------------------
      [maNV]
    );
    return rows;
  },

  // getActiveChiTrongForEmployee: async (maNV) => {
  //   const [rows] = await db.query(
  //     `
  //     SELECT ct.*,d.bang_luong_t
  //     FROM pm_luong_dot as d,
  //     pm_luong_chi_trong as ct
  //     LEFT JOIN pm_luong_status_luong as sl
  //     ON sl.id_trong = ct.id
  //     WHERE d.id = ct.id_dot
  //     AND ct.ma_nv = ?
  //     AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') >= d.time_start
  //     AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') <= d.time_end
  //     AND ((sl.tinh_trang NOT IN ('Đã xác nhận','Hết giờ','Câu hỏi') OR sl.tinh_trang IS NULL) OR (sl.tinh_trang = 'Câu hỏi' AND sl.tinh_trang_ns_khieu_nai = 'Cập nhật lại dữ liệu'))
  //   `,
  //     //  --------------------- Trước khi khiếu nại ------------------------  -----------------------------------Sau khi khiếu nại--------------------------
  //     [maNV]
  //   );
  //   return rows;
  // },

  getActiveChiTrongForEmployeeQL: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT ct.*,d.bang_luong_t
      FROM pm_luong_dot as d,
      pm_luong_chi_trong as ct
      LEFT JOIN pm_luong_status_luong as sl
      ON sl.id_trong = ct.id
      WHERE d.id = ct.id_dot
      AND ct.ma_nv = ?
      AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') >= d.time_start_ql
      AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00') <= d.time_end_ql
    `,
      [maNV]
    );
    return rows;
  },

  getActiveChiTrongForEmployeeSP: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT ct.*,d.bang_luong_t
      FROM pm_luong_dot as d,
      pm_luong_chi_trong as ct
      LEFT JOIN pm_luong_status_luong as sl
      ON sl.id_trong = ct.id
      WHERE d.id = ct.id_dot
      AND ct.ma_nv = ?
    `,
      [maNV]
    );
    return rows;
  },

  updateChiTrongOLD: async (data, id_dot) => {
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
      await connection.beginTransaction();

      // Bước 1: Tạo bảng tạm và chèn dữ liệu hiện có
      await connection.query(
        `
        CREATE TABLE temp_chi_trongnew AS
        SELECT * FROM pm_luong_chi_trong
        WHERE id_dot = ?
      `,
        [id_dot]
      );

      // Thêm khóa chính cho bảng tạm
      await connection.query(`
        ALTER TABLE temp_chi_trongnew
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
      const updatePromises = data.map(async (item) => {
        // Lấy dữ liệu hiện tại từ bảng tạm
        const [currentData] = await connection.query(
          "SELECT * FROM temp_chi_trongnew WHERE ma_nv = ? AND id_dot = ?",
          [item.ma_nv, id_dot]
        );

        if (currentData.length === 0) return; // Bỏ qua nếu không tìm thấy bản ghi

        const currentItem = currentData[0];
        const updates = [];
        const values = [];

        // Kiểm tra từng trường và chỉ cập nhật những trường đã thay đổi
        Object.keys(item).forEach((key) => {
          if (
            key !== "ma_nv" &&
            key !== "id_dot" &&
            hasChanged(currentItem[key], item[key])
          ) {
            const processedValue = processNumericString(item[key]);
            if (processedValue !== null) {
              if (key != "last_modified") {
                // Kiểm tra giá trị hợp lệ
                updates.push(`${key} = ?`);
                values.push(processedValue);
              }
            }
          }
        });

        // Nếu không có gì thay đổi, không cần cập nhật
        if (updates.length === 0) return; // Không có gì thay đổi

        // Chỉ cập nhật last_modified một lần
        updates.push("last_modified = CURRENT_TIMESTAMP");

        const sql = `
            UPDATE temp_chi_trongnew
            SET ${updates.join(", ")}
            WHERE ma_nv = ? AND id_dot = ?
          `;
        values.push(item.ma_nv, id_dot);

        return connection.query(sql, values);
      });

      await Promise.all(updatePromises.filter(Boolean));

      // Lấy thời gian cập nhật mới nhất
      const [lastModifiedResult] = await connection.query(
        "SELECT MAX(last_modified) as last_update FROM temp_chi_trongnew WHERE id_dot = ?",
        [id_dot]
      );

      // Bước 3: Cập nhật bảng chính từ bảng tạm
      await connection.query(`
        INSERT INTO pm_luong_chi_trong
        SELECT * FROM temp_chi_trongnew
        ON DUPLICATE KEY UPDATE
        ho_ten = VALUES(ho_ten),
        to_in_luong = VALUES(to_in_luong),
        ma_so_thue = VALUES(ma_so_thue),
        muc_luong_hd = VALUES(muc_luong_hd),
        gio_cong_thuc_te = VALUES(gio_cong_thuc_te),
        gio_cong_T7_CN_CT = VALUES(gio_cong_T7_CN_CT),
        gio_cong_ngay_thuong = VALUES(gio_cong_ngay_thuong),
        gio_cong_nghi = VALUES(gio_cong_nghi),
        gio_cong_phep_thoi_gian = VALUES(gio_cong_phep_thoi_gian),
        gio_cong_huan_luyen = VALUES(gio_cong_huan_luyen),
        luong_tg_phep = VALUES(luong_tg_phep),
        luong_truc_tiep = VALUES(luong_truc_tiep),
        luong_gian_tiep = VALUES(luong_gian_tiep),
        phu_cap_lam_dem = VALUES(phu_cap_lam_dem),
        luong_lam_them_ngay_thuong = VALUES(luong_lam_them_ngay_thuong),
        luong_lam_them_ngay_nghi = VALUES(luong_lam_them_ngay_nghi),
        thuong_kpi_san_xuat = VALUES(thuong_kpi_san_xuat),
        thuong_cb_nv_gioi = VALUES(thuong_cb_nv_gioi),
        phu_cap_kiem_viec = VALUES(phu_cap_kiem_viec),
        phu_cap_con_nho = VALUES(phu_cap_con_nho),
        phu_cap_di_lai_xang_xe = VALUES(phu_cap_di_lai_xang_xe),
        phu_cap_tien_an = VALUES(phu_cap_tien_an),
        thuong_hoan_thanh_kh_thang = VALUES(thuong_hoan_thanh_kh_thang),
        thuong_hoan_thanh_kh_ngay = VALUES(thuong_hoan_thanh_kh_ngay),
        bo_sung_tron_so_chi_tien_mat = VALUES(bo_sung_tron_so_chi_tien_mat),
        cac_khoan_khac = VALUES(cac_khoan_khac),
        tong_cong = VALUES(tong_cong),
        thue_thu_nhap = VALUES(thue_thu_nhap),
        bao_hiem = VALUES(bao_hiem),
        thu_hoi_phep = VALUES(thu_hoi_phep),
        thuc_lanh = VALUES(thuc_lanh),
        last_modified = VALUES(last_modified) 
      `);

      // Bước 4: Xóa bảng tạm
      await connection.query("DROP TABLE temp_chi_trongnew");

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

  updateChiTrong: async (data, id_dot) => {
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
      await connection.beginTransaction();

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

      // Lấy dữ liệu hiện tại từ bảng chính
      const [currentData] = await connection.query(
        "SELECT * FROM pm_luong_chi_trong WHERE id_dot = ?",
        [id_dot]
      );

      // Tạo một Map để dễ dàng tìm kiếm dữ liệu hiện tại
      const currentDataMap = new Map(
        currentData.map((item) => [item.ma_nv, item])
      );

      // Xử lý dữ liệu mới
      const updatedData = data
        .map((newItem) => {
          const currentItem = currentDataMap.get(newItem.ma_nv);
          if (!currentItem) return null; // Bỏ qua nếu không tìm thấy bản ghi hiện tại

          const updates = {};
          let hasUpdates = false;

          Object.keys(newItem).forEach((key) => {
            if (
              key !== "ma_nv" &&
              key !== "id_dot" &&
              hasChanged(currentItem[key], newItem[key])
            ) {
              const processedValue = processNumericString(newItem[key]);
              if (processedValue !== null && key !== "last_modified") {
                updates[key] = processedValue;
                hasUpdates = true;
              }
            }
          });

          if (!hasUpdates) return null;

          return {
            ...currentItem,
            ...updates,
            last_modified: new Date(),
          };
        })
        .filter(Boolean);

      if (updatedData.length > 0) {
        // Chuẩn bị câu lệnh SQL cho ON DUPLICATE KEY UPDATE
        const fields = Object.keys(updatedData[0]).filter(
          (key) => key !== "id"
        );
        const placeholders = fields.map(() => "?").join(", ");
        const updateClauses = fields
          .map((field) => `${field} = VALUES(${field})`)
          .join(", ");

        const sql = `
          INSERT INTO pm_luong_chi_trong (${fields.join(", ")})
          VALUES ${updatedData.map(() => `(${placeholders})`).join(", ")}
          ON DUPLICATE KEY UPDATE
          ${updateClauses}
        `;

        const values = updatedData.flatMap((item) =>
          fields.map((field) => item[field])
        );

        await connection.query(sql, values);
      }

      // Lấy thời gian cập nhật mới nhất
      const lastModified = updatedData.reduce(
        (max, item) => (item.last_modified > max ? item.last_modified : max),
        new Date(0)
      );

      await connection.commit();
      return {
        success: true,
        lastModified: lastModified,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  deleteChiTrong: async (id) => {
    await db.query("DELETE FROM pm_luong_chi_trong WHERE id = ?", [id]);
  },
};

module.exports = ChiTrong;
