const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../config/db");

let phienlogin = {}; // Đối tượng lưu trữ phiên đăng nhập

function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.on("login", async (data) => {
      const { MaNV, MatKhau } = data;
      console.log("MaNV: ", MaNV);
      console.log("MatKhau: ", MatKhau);
      try {
        const [rows] = await connection.query(
          `SELECT 
          nv.*,
          bp.id AS id_bo_phan,
          bp.ten_bo_phan,
          pb.id AS id_phong_ban_lam_viec,
          pb.ten_phong_ban,
          bp_phu_trach_new.id AS id_bo_phan_phu_trach,
          bp_phu_trach_new.ten_bo_phan AS ten_bo_phan_phu_trach,
          pb_phu_trach.id AS id_phong_ban_phu_trach,
          pb_phu_trach_new.ten_phong_ban AS ten_phong_ban_phu_trach,
          pq.id_chuc_danh as id_chuc_danh
        FROM 
          sync_data_hi_time_sheet.sync_nhan_vien AS nv
          LEFT JOIN pm_bo_phan_quan_ly_new AS bp_new ON nv.id_bo_phan = bp_new.id_bo_phan
          LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan AS bp ON bp_new.id_bo_phan = bp.id
          LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban AS pb ON bp.id_phong_ban = pb.id
          LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan AS bp_phu_trach_new ON bp_phu_trach_new.phu_trach = nv.ma_nv
          LEFT JOIN pm_phong_ban_quan_ly_new AS pb_phu_trach ON pb_phu_trach.phu_trach = nv.ma_nv
          LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban AS pb_phu_trach_new ON pb_phu_trach_new.id = pb_phu_trach.id_phong_ban
          LEFT JOIN pm_luong_nv_phan_quyen pq on nv.ma_nv = pq.ma_nv
        WHERE 
          nv.ma_nv = ?`,
          [MaNV]
        );

        if (rows.length === 0) {
          return socket.emit("login_failed", {
            message: "Tên đăng nhập không tồn tại.",
          });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(MatKhau, user.mat_khau);
        if (!isMatch) {
          return socket.emit("login_failed", {
            message: "Tên đăng nhập hoặc mật khẩu không đúng",
          });
        }

        // Cập nhật trạng thái đăng nhập
        await connection.query(
          `UPDATE sync_data_hi_time_sheet.sync_nhan_vien SET is_login = ? WHERE ma_nv = ?`,
          [socket.id, MaNV]
        );

        // Xác định vai trò
        const role =
          user.id_chuc_danh === 2 || user.id_chuc_danh === 1 ? "admin" : "user";
        const roleAll = user.id_phong_ban_phu_trach
          ? "QL"
          : user.id_bo_phan_phu_trach
          ? "TT"
          : "user";
        const isSUPER = user.id_chuc_danh === 1 ? true : false;

        // Kiểm tra đăng nhập ở thiết bị khác
        if (phienlogin[MaNV] && phienlogin[MaNV] !== socket.id) {
          io.to(phienlogin[MaNV]).emit("force_logout", {
            message: "Bạn đã đăng nhập ở thiết bị khác, bạn sẽ bị đăng xuất.",
          });
          io.sockets.sockets.get(phienlogin[MaNV])?.disconnect(true);
        }
        phienlogin[MaNV] = socket.id;

        // Tạo token JWT
        const token = jwt.sign(
          {
            id: user.id,
            ma_nv: user.ma_nv,
            role: role,
            roleAll: roleAll,
            isSUPER: isSUPER,
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        // Gửi phản hồi đăng nhập thành công
        socket.emit("login_success", {
          message: "Đăng nhập thành công",
          data: {
            user: {
              ten_nv: user.ten_nv,
              ma_nv: user.ma_nv,
              id: user.id,
              id_bo_phan: user.id_bo_phan,
              role: role,
              roleAll: roleAll,
              isSUPER: isSUPER,
            },
            token,
            phienlogin,
          },
        });
      } catch (error) {
        console.error("Error during login:", error);
        socket.emit("login_failed", {
          message: "Đã xảy ra lỗi trong quá trình đăng nhập.",
        });
      }
    });

    socket.on("logout", () => {
      console.log(`User ${socket.id} logged out.`);
      for (let MaNV in phienlogin) {
        if (phienlogin[MaNV] === socket.id) {
          console.log(`Removing session for MaNV: ${MaNV}`);
          delete phienlogin[MaNV];
          break;
        }
      }
      // Cập nhật trạng thái đăng nhập trong database
      // Ví dụ:
      connection.query(
        "UPDATE sync_data_hi_time_sheet.sync_nhan_vien SET is_login = NULL WHERE is_login = ?",
        [socket.id]
      );
      socket.emit("logout_success", {
        message: "Đăng xuất thành công.",
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnect...");
      for (let MaNV in phienlogin) {
        if (phienlogin[MaNV] === socket.id) {
          delete phienlogin[MaNV];
          break;
        }
      }
    });
  });
}

module.exports = setupSocket;
