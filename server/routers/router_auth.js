const express = require("express");
const { login, logout } = require("../controllers/controller_auth");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../config/db");
require("dotenv").config();

router.post("/login", login);
router.post("/logout", logout);
// Route cần bảo vệ
router.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "You have access to this route!" });
});

router.post("/refresh-token", async (req, res) => {
  console.log(req.headers);
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

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
          pb_phu_trach_new.ten_phong_ban AS ten_phong_ban_phu_trach
        FROM 
          sync_data_hi_time_sheet.sync_nhan_vien AS nv
          LEFT JOIN pm_bo_phan_quan_ly_new AS bp_new ON nv.id_bo_phan = bp_new.id_bo_phan
          LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan AS bp ON bp_new.id_bo_phan = bp.id
          LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban AS pb ON bp.id_phong_ban = pb.id
          LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan AS bp_phu_trach_new ON bp_phu_trach_new.phu_trach = nv.ma_nv
          LEFT JOIN pm_phong_ban_quan_ly_new AS pb_phu_trach ON pb_phu_trach.phu_trach = nv.ma_nv
          LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban AS pb_phu_trach_new ON pb_phu_trach_new.id = pb_phu_trach.id_phong_ban
        WHERE 
        nv.ma_nv = ?`,
      [decoded.ma_nv]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const user = rows[0];

    // Xác định vai trò
    const role = user.id_bo_phan === 76 ? "admin" : "user";
    const roleAll = user.id_phong_ban_phu_trach ? "QL" : "user";
    const isSUPER =
      user.ma_nv === "00055" || user.ma_nv === "00005" ? true : false;

    // Tạo token JWT mới
    const newToken = jwt.sign(
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

    res.json({
      message: "Refresh token thành công",
      token: newToken,
      user: {
        ten_nv: user.ten_nv,
        ma_nv: user.ma_nv,
        id: user.id,
        id_bo_phan: user.id_bo_phan,
        role: role,
        roleAll: roleAll,
        isSUPER: isSUPER,
      },
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
});



module.exports = router;
