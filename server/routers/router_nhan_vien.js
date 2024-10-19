// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const NhanVien = require("../controllers/controller_nhan_vien.js");

// Get All
router.get("/", NhanVien.getAllNhanViens);
// Thêm route mới cho phân trang
router.get("/bymanv/:ma_nv", NhanVien.getNhanVienByMaNV);
router.get("/bymanvlike/:ma_nv", NhanVien.getNhanVienByMaNVLike);
router.get("/limit", NhanVien.getAllNhanViensByLimit);
// Get By ID
router.get("/:id", NhanVien.getNhanVienById);
// Create
router.post("/", NhanVien.createNhanVien);
// Delete
router.delete("/:id", NhanVien.deleteNhanVien);
// Update
router.put("/:id", NhanVien.updateNhanVien);

module.exports = router;
