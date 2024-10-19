// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const StatusLuong = require("../controllers/controller_status_luong.js");

// Get All
router.get("/", StatusLuong.getAllStatusLuong);
// // Get All
// router.get("/status-done", StatusLuong.getStatusLuongByStatusDone);
// router.get("/status-pending", StatusLuong.getStatusLuongByStatusPending);
// router.get("/status-complaints", StatusLuong.getStatusLuongByStatusComplaints);
// Thêm route mới cho thống kê dashboard
router.get("/stats/:dotId", StatusLuong.getDashboardStats);

// Get By ID

router.get("/:id", StatusLuong.getStatusLuongById);
// Create
router.post("/", StatusLuong.createStatusLuong);
router.get("/out-page/:id_dot/:id_trong", StatusLuong.getStatusLuongOutPage);
router.get(
  "/out-pagecn/:id_dot/:id_ngoai",
  StatusLuong.getStatusLuongOutPageCN
);
router.get(
  "/complaints/:id_dot/:id_trong",
  StatusLuong.getStatusLuongComplaints
);
router.get(
  "/complaintscn/:id_dot/:id_ngoai",
  StatusLuong.getStatusLuongComplaintsCN
);


// Thêm dòng này vào file router của bạn
router.get(
  "/check-extension/:id_trong_ngoai/:id_dot",
  StatusLuong.checkExtensionRequested
);
// Delete
router.delete("/:id", StatusLuong.deleteStatusLuong);
// Update
router.put("/:id", StatusLuong.updateStatusLuong);
router.put(
  "/update-status-luong-xin-gia-han/:id_trong_ngoai/:id_dot",
  StatusLuong.updateStatusLuongXinGiaHan
);


router.put("/update/update-multiple", StatusLuong.updateMultipleStatusLuong);

module.exports = router;
