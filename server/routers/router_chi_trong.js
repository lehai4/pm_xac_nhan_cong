// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const ChiTrong = require("../controllers/controller_chi_trong.js");

// Get All
router.get("/", ChiTrong.getAllChiTrongs);
// Get By ID
router.get("/:id", ChiTrong.getChiTrongById);
// Get By ID Dot
router.get("/id_dot/:id_dot", ChiTrong.getChiTrongByIdDot);
// Get By MaNV
router.get("/salary/:ma_nv", ChiTrong.getChiTrongByMaNV);
// Create
router.post("/", ChiTrong.createChiTrong);
// Delete
router.delete("/:id", ChiTrong.deleteChiTrong);
// Update Status  
// router.put("/status/:id", ChiTrong.updateChiTrongStatus);
router.put("/savechitrong", ChiTrong.saveChiTrong);
// Route để lấy Chi Trong đang hoạt động cho nhân viên
router.get("/active-chitrong/:maNV", ChiTrong.getActiveChiTrongForEmployee);
router.get(
  "/active-chitrong-ql/:maNV",
  ChiTrong.getActiveChiTrongForEmployeeQL
);

router.get(
  "/active-chitrong-sp/:maNV",
  ChiTrong.getActiveChiTrongForEmployeeSP
);

module.exports = router;
