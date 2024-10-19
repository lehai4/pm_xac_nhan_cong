// models/userModel.js
const db = require("../config/db");
const moment = require("moment");

const DotCong = {
  getAllCongMains: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_cong_main as cm join pm_cong_dot as cd ON cm.id_dot_cong = cd.id where cd.is_Active = 1 AND cd.bang_cong_t = ?",
      [month]
    );
    return rows;
  },
  getAllDotCongs: async () => {
    const [rows] = await db.query("SELECT * FROM pm_cong_dot");
    return rows;
  },
  getDotCongByMonth: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_cong_dot WHERE bang_cong_t = ? AND is_Active = 1",
      [month]
    );
    return rows;
  },

  getPmSynchronousCong: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_synchronous_cong where MONTHYEAR = ?",
      [month]
    );
    return rows;
  },
  getDotCongByMonthNoActive: async (month) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_cong_dot WHERE bang_cong_t = ?",
      [month]
    );
    return rows;
  },

  getDotCongByPeriodName: async (periodName) => {
    const [rows] = await db.query(
      "SELECT * FROM pm_cong_dot WHERE ten_dot = ? AND is_Active = 1",
      [periodName]
    );
    return rows[0];
  },

  getDotCongById: async (id) => {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericId)) {
      throw new Error("Invalid ID");
    }
    const [rows] = await db.query(
      ` SELECT 
          cd.*
          FROM 
          pm_cong_dot AS cd
          JOIN 
          pm_cong_dot_phong_ban_time_allow_view AS cpb 
          ON 
          cd.id = cpb.id_dot
        WHERE 
      cd.id = ? 
      AND cd.is_Active = 1`,
      [numericId]
    );
    return rows[0];
  },

  getHSTByIdDot: async (id_dot) => {
    const [dot] = await db.query(
      "SELECT is_Active FROM pm_cong_dot WHERE id = ?",
      [id_dot]
    );

    // Kiểm tra nếu is_Active là false
    if (dot.length === 0 || dot[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt công không hoạt động.");
    }
    // Chuyển đổi Ma_nv từ chuỗi thành số nguyên
    const numericIdDot = id_dot;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericIdDot)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_he_so_thuong WHERE id_dot_cong = ?",
      [numericIdDot]
    );
    return rows;
  },

  getGCGCByIdDot: async (id_dot) => {
    const [dot] = await db.query(
      "SELECT is_Active FROM pm_cong_dot WHERE id = ?",
      [id_dot]
    );

    // Kiểm tra nếu is_Active là false
    if (dot.length === 0 || dot[0].is_Active === 0) {
      throw new Error("Không thể cập nhật đợt công không hoạt động.");
    }
    // Chuyển đổi Ma_nv từ chuỗi thành số nguyên
    const numericIdDot = id_dot;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về null hoặc lỗi
    if (isNaN(numericIdDot)) {
      throw new Error("Invalid ID");
    }

    const [rows] = await db.query(
      "SELECT * FROM pm_gio_cong_gian_ca WHERE id_dot_cong = ?",
      [numericIdDot]
    );
    return rows;
  },

  createTableHeSoThuong: async (heSoThuongArray, dotCongId) => {
    if (!Array.isArray(heSoThuongArray)) {
      throw new Error("heSoThuongArray phải là một mảng");
    }
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (let hesoThuong of heSoThuongArray) {
        const {
          f_To,
          so_the,
          ho,
          ten,
          cot1,
          cot2,
          cot3,
          cot4,
          cot5,
          cot6,
          cot7,
          cot8,
          cot9,
          cot10,
          cot11,
          cot12,
          cot13,
          cot14,
          cot15,
          cot16,
          cot17,
          cot18,
          cot19,
          cot20,
          cot21,
          cot22,
          cot23,
          cot24,
          cot25,
          cot26,
          cot27,
          cot28,
          cot29,
          cot30,
          cot31,
          vpcl,
          vpkl,
          o,
          hsbq,
          hsbqthg,
          ky_ten,
        } = hesoThuong;
        await db.query(
          `INSERT INTO pm_he_so_thuong (
          f_To,
          so_the,
          ho,
          ten,
          cot1,
          cot2,
          cot3,
          cot4,
          cot5,
          cot6,
          cot7,
          cot8,
          cot9,
          cot10,
          cot11,
          cot12,
          cot13,
          cot14,
          cot15,
          cot16,
          cot17,
          cot18,
          cot19,
          cot20,
          cot21,
          cot22,
          cot23,
          cot24,
          cot25,
          cot26,
          cot27,
          cot28,
          cot29,
          cot30,
          cot31,
          vpcl,
          vpkl,
          o,
          hsbq,
          hsbqthg,
          ky_ten, id_dot_cong) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            f_To,
            so_the,
            ho,
            ten,
            cot1,
            cot2,
            cot3,
            cot4,
            cot5,
            cot6,
            cot7,
            cot8,
            cot9,
            cot10,
            cot11,
            cot12,
            cot13,
            cot14,
            cot15,
            cot16,
            cot17,
            cot18,
            cot19,
            cot20,
            cot21,
            cot22,
            cot23,
            cot24,
            cot25,
            cot26,
            cot27,
            cot28,
            cot29,
            cot30,
            cot31,
            vpcl,
            vpkl,
            o,
            hsbq,
            hsbqthg,
            ky_ten,
            dotCongId,
          ]
        );
      }
      await connection.commit(); // Commit transaction
    } catch (err) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw err;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  createTableGioCongGianCa: async (gioCongGianCaArray, dotCongId) => {
    if (!Array.isArray(gioCongGianCaArray)) {
      throw new Error("gioCongGianCaArray phải là một mảng");
    }
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (let gioconggianca of gioCongGianCaArray) {
        const {
          stt,
          so_the,
          ho,
          ten,
          hanh_Chinh_Ca,
          ca3,
          ngay_Thuong,
          ngay_Nghi_Hang_Tuan,
          ngay_Le,
          phep,
          ky_ten,
        } = gioconggianca;

        await db.query(
          `INSERT INTO pm_gio_cong_gian_ca (stt, so_the, ho, ten, hanh_Chinh_Ca, ca3, ngay_Thuong, ngay_Nghi_Hang_Tuan, ngay_Le, phep, ky_ten, id_dot_cong) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            stt,
            so_the,
            ho,
            ten,
            hanh_Chinh_Ca,
            ca3,
            ngay_Thuong,
            ngay_Nghi_Hang_Tuan,
            ngay_Le,
            phep,
            ky_ten,
            dotCongId,
          ]
        );
      }
      await connection.commit(); // Commit transaction
    } catch (err) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw err;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  formatMonth: (dateStr) => {
    const [month, year] = dateStr.split("-");
    const formattedMonth = parseInt(month, 10); // Kết quả là 10, không bị sai
    const formattedDate = `${formattedMonth}-${year}`;
    return formattedDate;
  },
  createTableBangCongChinh: async (bang_cong_t, dotCongId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      const format = DotCong.formatMonth(bang_cong_t);
      console.log("format", format);
      const data = await DotCong.getPmSynchronousCong(format);
      console.log("data", data);
      for (let item of data) {
        await db.query(
          `INSERT INTO pm_cong_main (so_the, ho, ten, hanh_chinh_ca1_ca2, ca3, ngay_thuong, ngay_nghi_hang_tuan, ngay_le, gc_thai_thu_7,
          gc_nuoi_con_nho, gc_nguoi_cao_tuoi, gc_cong_tac, phep, om, con_om, viec_rieng_co_luong, viec_rieng_khong_luong, khong_ly_do, kham_thai,
          thai_san, duong_suc, trong_gio, ngoai_gio, gc_ngung_viec, gc_nghi_le, id_dot_cong) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            item.SOTHE,
            item.HO,
            item.TEN,
            item.GCTT + item.vaotre + item.rasom - item.NCC3 * item.GCGC,
            item.NCC3 * item.GCGC,
            item.GCGC,
            item.GCLT,
            (item.NCLC3 + item.NCLC1C2) * item.GCGC,
            item.tt7 * item.GCGC,
            item.cb * item.GCGC,
            item.ct * item.GCGC,
            item.ctac * item.GCGC,
            item.f * item.GCGC,
            item.om * item.GCGC,
            item.co * item.GCGC,
            item.r * item.GCGC,
            item.ro * item.GCGC,
            item.o * item.GCGC,
            item.kt * item.GCGC,
            item.ts * item.GCGC,
            item.ds * item.GCGC,
            item.GCHOCTG,
            item.GCHOCNG,
            item.ngv * item.GCGC,
            item.l * item.GCGC,
            dotCongId,
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

  createDotCong: async (DotCongArray) => {
    if (!Array.isArray(DotCongArray)) {
      throw new Error("DotCongArray phải là một mảng");
    }
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction
      const newDotCongIds = [];
      for (const dotCong of DotCongArray) {
        const {
          ten_dot,
          bang_cong_t,
          time_start,
          time_end,
          time_xem,
          loai_phieu,
          time_start_ql,
          time_end_ql,
          is_Active,
        } = dotCong;

        const [result] = await connection.query(
          `INSERT INTO pm_cong_dot (
              ten_dot, bang_cong_t, time_start, time_end, time_xem, loai_phieu, time_start_ql, time_end_ql, is_Active
            ) VALUES (?, ?, ?, ?,?, ?, ?, ?, 1)`,
          [
            ten_dot,
            bang_cong_t,
            time_start,
            time_end,
            time_xem,
            loai_phieu,
            time_start_ql,
            time_end_ql,
            is_Active,
          ]
        );
        newDotCongIds.push(result.insertId);
      }

      await connection.commit(); // Commit transaction
      return newDotCongIds;
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Đảm bảo giải phóng kết nối
    }
  },

  updateIsActive: async (dotCongUpdates) => {
    const connection = await db.getConnection(); // Sử dụng getConnection nếu bạn dùng pool
    try {
      await connection.beginTransaction(); // Bắt đầu transaction
      for (const update of dotCongUpdates) {
        const { id, is_Active } = update; // Lấy ID và giá trị mới cho is_Active

        await connection.query(
          `UPDATE pm_cong_dot
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

  updateCong: async (id, dotCong) => {
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
      if (dotCong[field] !== undefined && dotCong[field] !== null) {
        updateFields.push(`${field} = ?`);
        if (field === "time_xem") {
          // Xử lý đặc biệt cho time_xem (chỉ thời gian)
          const timeValue = moment(dotCong[field], ["HH:mm:ss", "HH:mm"], true);
          if (timeValue.isValid()) {
            updateValues.push(timeValue.format("HH:mm:ss"));
          } else {
            throw new Error(
              `Invalid time format for time_xem: ${dotCong[field]}`
            );
          }
        } else {
          // Chuyển đổi định dạng datetime cho các trường khác
          const dateValue = moment(
            dotCong[field],
            [moment.ISO_8601, "YYYY/MM/DD HH:mm:ss", "YYYY-MM-DD HH:mm:ss"],
            true
          );
          if (dateValue.isValid()) {
            updateValues.push(dateValue.format("YYYY-MM-DD HH:mm:ss"));
          } else {
            throw new Error(
              `Invalid date format for ${field}: ${dotCong[field]}`
            );
          }
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `UPDATE pm_cong_dot SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    updateValues.push(id);

    const [result] = await db.query(query, updateValues);

    return result.affectedRows > 0;
  },

  updateHSTArray: async (data, id_dot) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Bước 1: Lấy dữ liệu hiện có từ cơ sở dữ liệu
      const [existingData] = await connection.query(
        "SELECT * FROM pm_he_so_thuong WHERE id_dot_cong = ?",
        [id_dot]
      );
      // Bước 2: Tạo một Map để dễ dàng tìm kiếm dữ liệu hiện có
      const existingDataMap = new Map(
        existingData.map((item) => [`${item.so_the}_${item.id_dot_cong}`, item])
      );
      // Bước 3: Kết hợp dữ liệu hiện có với dữ liệu mới
      const updatedData = data.map((newItem) => {
        const key = `${newItem.so_the}_${id_dot}`;
        const existingItem = existingDataMap.get(key);
        if (existingItem) {
          return {
            ...existingItem,
            ...newItem,
            id_dot_cong: id_dot,
          };
        } else {
          return {
            ...newItem,
            id_dot_cong: id_dot,
          };
        }
      });

      // Bước 4: Cập nhật hoặc chèn dữ liệu
      const updatePromises = updatedData.map((item) => {
        const sql = `
          INSERT INTO pm_he_so_thuong (
          f_To,
          so_the,
          ho,
          ten,
          cot1,
          cot2,
          cot3,
          cot4,
          cot5,
          cot6,
          cot7,
          cot8,
          cot9,
          cot10,
          cot11,
          cot12,
          cot13,
          cot14,
          cot15,
          cot16,
          cot17,
          cot18,
          cot19,
          cot20,
          cot21,
          cot22,
          cot23,
          cot24,
          cot25,
          cot26,
          cot27,
          cot28,
          cot29,
          cot30,
          cot31,
          vpcl,
          vpkl,
          o,
          hsbq,
          hsbqthg,
          ky_ten, id_dot_cong) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
          f_To = VALUES(f_To),
          ho = VALUES(ho),
          ten = VALUES(ten),
          cot1 = VALUES(cot1),
          cot2 = VALUES(cot2),
          cot3 = VALUES(cot3),
          cot4 = VALUES(cot4),
          cot5 = VALUES(cot5),
          cot6 = VALUES(cot6),
          cot7 = VALUES(cot7),
          cot8 = VALUES(cot8),
          cot9 = VALUES(cot9),
          cot10 = VALUES(cot10),
          cot11 = VALUES(cot11),
          cot12 = VALUES(cot12),
          cot13 = VALUES(cot13),
          cot14 = VALUES(cot14),
          cot15 = VALUES(cot15),
          cot16 = VALUES(cot16),
          cot17 = VALUES(cot17),
          cot18 = VALUES(cot18),
          cot19 = VALUES(cot19),
          cot20 = VALUES(cot20),
          cot21 = VALUES(cot21),
          cot22 = VALUES(cot22),
          cot23 = VALUES(cot23),
          cot24 = VALUES(cot24),
          cot25 = VALUES(cot25),
          cot26 = VALUES(cot26),
          cot27 = VALUES(cot27),
          cot28 = VALUES(cot28),
          cot29 = VALUES(cot29),
          cot30 = VALUES(cot30),
          cot31 = VALUES(cot31),
          vpcl = VALUES(vpcl),
          vpkl = VALUES(vpkl),
          o = VALUES(o),
          hsbq = VALUES(hsbq),
          hsbqthg = VALUES(hsbqthg),
          ky_ten = VALUES(ky_ten)
        `;
        const values = [
          item.f_To,
          item.so_the,
          item.ho,
          item.ten,
          item.cot1,
          item.cot2,
          item.cot3,
          item.cot4,
          item.cot5,
          item.cot6,
          item.cot7,
          item.cot8,
          item.cot9,
          item.cot10,
          item.cot11,
          item.cot12,
          item.cot13,
          item.cot14,
          item.cot15,
          item.cot16,
          item.cot17,
          item.cot18,
          item.cot19,
          item.cot20,
          item.cot21,
          item.cot22,
          item.cot23,
          item.cot24,
          item.cot25,
          item.cot26,
          item.cot27,
          item.cot28,
          item.cot29,
          item.cot30,
          item.cot31,
          item.vpcl,
          item.vpkl,
          item.o,
          item.hsbq,
          item.hsbqthg,
          item.ky_ten,
          item.id_dot_cong,
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

  updateGCGCArray: async (data, id_dot) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Bước 1: Lấy dữ liệu hiện có từ cơ sở dữ liệu
      const [existingData] = await connection.query(
        "SELECT * FROM pm_gio_cong_gian_ca WHERE id_dot_cong = ?",
        [id_dot]
      );
      // Bước 2: Tạo một Map để dễ dàng tìm kiếm dữ liệu hiện có
      const existingDataMap = new Map(
        existingData.map((item) => [`${item.so_the}_${item.id_dot_cong}`, item])
      );
      // Bước 3: Kết hợp dữ liệu hiện có với dữ liệu mới
      const updatedData = data.map((newItem) => {
        const key = `${newItem.so_the}_${id_dot}`;
        const existingItem = existingDataMap.get(key);
        if (existingItem) {
          return {
            ...existingItem,
            ...newItem,
            id_dot_cong: id_dot,
          };
        } else {
          return {
            ...newItem,
            id_dot_cong: id_dot,
          };
        }
      });

      // Bước 4: Cập nhật hoặc chèn dữ liệu
      const updatePromises = updatedData.map((item) => {
        const sql = `
          INSERT INTO pm_gio_cong_gian_ca (stt, so_the, ho, ten, hanh_Chinh_Ca, ca3, ngay_Thuong, ngay_Nghi_Hang_Tuan, ngay_Le, phep, ky_ten, id_dot_cong) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          
          ON DUPLICATE KEY UPDATE
          stt = VALUES(stt),
          ho = VALUES(ho),
          ten = VALUES(ten),
          hanh_Chinh_Ca = VALUES(hanh_Chinh_Ca),
          ca3 = VALUES(ca3),
          ngay_Thuong = VALUES(ngay_Thuong),
          ngay_Nghi_Hang_Tuan = VALUES(ngay_Nghi_Hang_Tuan),
          ngay_Le = VALUES(ngay_Le),
          phep = VALUES(phep),
          ky_ten = VALUES(ky_ten)
        `;
        const values = [
          item.stt,
          item.so_the,
          item.ho,
          item.ten,
          item.hanh_Chinh_Ca,
          item.ca3,
          item.ngay_Thuong,
          item.ngay_Nghi_Hang_Tuan,
          item.ngay_Le,
          item.phep,
          item.ky_ten,
          id_dot,
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

  // có body
  getActiveHeSoThuongForEmployeeSP: async (maNV, month) => {
    const [rows] = await db.query(
      `
      SELECT hst.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_he_so_thuong as hst
      WHERE d.id = hst.id_dot_cong
      AND hst.so_the = ?  AND d.bang_cong_t = ? AND d.is_Active = 1
    `,
      [maNV, month]
    );
    return rows;
  },
  getActiveGCGCForEmployeeSP: async (maNV, month) => {
    const [rows] = await db.query(
      `
      SELECT gcgc.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_gio_cong_gian_ca as gcgc
      WHERE d.id = gcgc.id_dot_cong
      AND gcgc.so_the = ? AND d.bang_cong_t = ? AND d.is_Active = 1
    `,
      [maNV, month]
    );
    return rows;
  },
  getActiveCongMainForEmployeeSP: async (maNV, month) => {
    const [rows] = await db.query(
      `
      SELECT cm.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_cong_main as cm
      WHERE d.id = cm.id_dot_cong
      AND cm.so_the = ? AND d.bang_cong_t = ? AND d.is_Active = 1
    `,
      [maNV, month]
    );
    return rows;
  },

  // không body
  getActiveHeSoThuongForEmployeeSPP: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT hst.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_he_so_thuong as hst
      WHERE d.id = hst.id_dot_cong
      AND hst.so_the = ? AND d.is_Active = 1
    `,
      [maNV]
    );
    return rows;
  },
  getActiveGCGCForEmployeeSPP: async (maNV, month) => {
    const [rows] = await db.query(
      `
      SELECT gcgc.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_gio_cong_gian_ca as gcgc
      WHERE d.id = gcgc.id_dot_cong
      AND gcgc.so_the = ? AND d.is_Active = 1
    `,
      [maNV]
    );
    return rows;
  },
  getActiveCongMainForEmployeeSPP: async (maNV) => {
    const [rows] = await db.query(
      `
      SELECT cm.*,d.bang_cong_t
      FROM pm_cong_dot as d,
      pm_cong_main as cm
      WHERE d.id = cm.id_dot_cong
      AND cm.so_the = ? AND d.is_Active = 1
    `,
      [maNV]
    );
    return rows;
  },
};
module.exports = DotCong;
