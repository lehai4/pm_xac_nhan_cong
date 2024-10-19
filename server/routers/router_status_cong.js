// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const StatusCong = require("../controllers/controller_status_cong.js");

// Get All
router.get("/", StatusCong.getAllStatusCong);

// Thêm route mới cho thống kê dashboard
router.get("/stats/:dotId", StatusCong.getDashboardStats);

// Get By ID

router.get("/:id", StatusCong.getStatusCongById);
// Create
router.post("/", StatusCong.createStatusCong);
router.get("/out-page/:id_dot/:id_hst", StatusCong.getStatusCongOutPage);
router.get(
  "/out-pagegcgc/:id_dot/:id_gcgc",
  StatusCong.getStatusCongOutPageGCGC
);

router.get("/complaints/:id_dot/:id_hst", StatusCong.getStatusCongComplaints);
router.get(
  "/complaintsgcgc/:id_dot/:id_gcgc",
  StatusCong.getStatusCongComplaintsGCGC
);

// Thêm dòng này vào file router của bạn
router.get(
  "/check-extension/:id_hst_gcgc/:id_dot",
  StatusCong.checkExtensionRequested
);
// Delete
router.delete("/:id", StatusCong.deleteStatusCong);
// Update
router.put("/:id", StatusCong.updateStatusCong);
router.put(
  "/update-status-cong-xin-gia-han/:id_hst_gcgc/:id_dot",
  StatusCong.updateStatusCongXinGiaHan
);

router.put("/update/update-multiple", StatusCong.updateMultipleStatusCong);

module.exports = router;
