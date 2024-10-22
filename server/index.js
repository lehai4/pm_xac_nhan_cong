const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();
const promisePool = require("./config/db");
const setupSocket = require("./middleware/socket");
const path = require("path");
const cron = require("node-cron");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Middleware để parse JSON body
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Import routes
const ChiNgoai = require("./routers/router_chi_ngoai.js");
const ChiTrong = require("./routers/router_chi_trong.js");
const BoPhan = require("./routers/router_bo_phan.js");
const NhanVien = require("./routers/router_nhan_vien.js");
const PhanQuyen = require("./routers/router_phan_quyen.js");
const PhongBan = require("./routers/router_phong_ban.js");
const Role = require("./routers/router_role.js");
const authRoutes = require("./routers/router_auth.js");
const uploadCsvRoutes = require("./routers/router_upfileCSV.js");
const dotLuongRoutes = require("./routers/router_dot_luong.js");
const dotCongRoutes = require("./routers/router_dot_cong.js");
const statausRoutes = require("./routers/router_status_luong.js");
const statusCongRoutes = require("./routers/router_status_cong.js");
const salaryRoutes = require("./routers/router_searchSalary.js");
const congRoutes = require("./routers/router_searchCong.js");
const dashboardRoutes = require("./routers/router_dashboard.js");

// Sử dụng routes
app.use("/api/chingoai", ChiNgoai);
app.use("/api/chitrong", ChiTrong);
app.use("/api/bophan", BoPhan);
app.use("/api/nhanvien", NhanVien);
app.use("/api/phanquyen", PhanQuyen);
app.use("/api/phongban", PhongBan);
app.use("/api/role", Role);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadCsvRoutes);
app.use("/api/dotluong", dotLuongRoutes);
app.use("/api/statusluong", statausRoutes);
app.use("/api/statusCong", statusCongRoutes);
app.use("/api/salarys", salaryRoutes);
app.use("/api/congs", congRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dotcong", dotCongRoutes);
// Thiết lập Socket.IO
setupSocket(io);

const updateStatusJob = async () => {
  try {
    const [result] = await promisePool.execute(
      `UPDATE pm_luong_status_luong 
       SET tinh_trang = 'Chưa xác nhận', 
           last_modified = NOW()
       WHERE tinh_trang = 'Đang xem' AND TIMESTAMPDIFF(MINUTE, last_modified, NOW()) > 20`
    );

    console.log(
      `Đã cập nhật ${result.affectedRows} bản ghi từ 'Đang xem' sang 'Chưa xác nhận'`
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lương:", error);
  }
};

const updateStatusWorkHours = async () => {
  try {
    const [result] = await promisePool.execute(
      `UPDATE pm_cong_status_cong 
       SET tinh_trang = 'Chưa xác nhận', 
           last_modified = NOW()
       WHERE tinh_trang = 'Đang xem' AND TIMESTAMPDIFF(MINUTE, last_modified, NOW()) > 20`
    );

    console.log(
      `Đã cập nhật ${result.affectedRows} bản ghi từ 'Đang xem' sang 'Chưa xác nhận' cho bảng công`
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lương:", error);
  }
};
// Lập lịch cron job để chạy mỗi giờ
cron.schedule("0 * * * *", updateStatusJob);

cron.schedule("0 * * * *", updateStatusWorkHours);
// Khởi động server
// Thêm endpoint kiểm tra sức khỏe
app.get("/home", (req, res) => {
  console.log("done");
  res.sendFile(path.join(__dirname, "assets", "logo.png"));
});

const PORT = process.env.PORT || 3000;

// server.listen(PORT, "171.244.39.87", () => {
//   console.log(`Node server running @ http://171.244.39.87:${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Node server running @ http://localhost:${PORT}`);
});
