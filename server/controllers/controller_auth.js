const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const NhanVien = require("../models/model_nhan_vien");

exports.login = async (req, res) => {
  const { ma_nv, mat_khau } = req.body;

  try {
    const nhanVien = await NhanVien.findByMaNV(ma_nv);

    if (!nhanVien) {
      return res.status(404).json({ error: "Không tìm thấy Nhân viên" });
    }
    // Check if the user is already logged in
    // const isLoggedIn = await NhanVien.checkLoginStatus(ma_nv);
    // if (Buffer.isBuffer(isLoggedIn)) {
    //   // Chuyển đổi Buffer thành số
    //   const loginStatus = isLoggedIn.readInt8(0);
    //   if (loginStatus === 1) {
    //     return res.status(400).json({ error: "Người dùng đã đăng nhập" });
    //   }
    // } else if (isLoggedIn === true) {
    //   return res.status(400).json({ error: "Người dùng đã đăng nhập" });
    // }
    // const isLoggedIn = await NhanVien.checkLoginStatus(ma_nv);
    // if (isLoggedIn) {
    //   return res.status(400).json({ error: "Người dùng đã đăng nhập" });
    // }

    const isMatch = await bcrypt.compare(mat_khau, nhanVien.mat_khau);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update login status to true
    await NhanVien.updateLoginStatus(ma_nv, true);

    // Xác định vai trò dựa trên id_bo_phan
    const role = nhanVien.id_bo_phan === 76 ? "admin" : "user";
    const roleAll = nhanVien.id_phong_ban_phu_trach
      ? "QL"
      : nhanVien.id_bo_phan_phu_trach
      ? "TT"
      : "user";
    // Tạo token JWT với thông tin vai trò
    const token = jwt.sign(
      {
        id: nhanVien.id_SQL,
        ma_nv: nhanVien.ma_nv,
        role: role,
        roleAll: roleAll,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        ten_nv: nhanVien.ten_nv,
        ma_nv: nhanVien.ma_nv,
        id: nhanVien.id,
        id_bo_phan: nhanVien.id_bo_phan,
        role: role,
        roleAll: roleAll,
      },
    });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    console.log(error);
  }
};

// Hàm để xác thực token và lấy thông tin người dùng
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: "Invalid token" };
  }
};

// Hàm kiểm tra quyền admin
exports.checkAdminRole = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  const verificationResult = this.verifyToken(token);

  if (!verificationResult.success) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (verificationResult.data.role !== "admin") {
    return res.status(403).json({ error: "Require Admin Role" });
  }

  req.user = verificationResult.data;
  next();
};

// Hàm để đăng xuất
exports.logout = async (req, res) => {
  const { ma_nv } = req.body;

  try {
    await NhanVien.updateLoginStatus(ma_nv, false);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};