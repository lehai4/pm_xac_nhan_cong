// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const ChiNgoai = require("../controllers/controller_chi_ngoai.js");

// Get All
router.get("/", ChiNgoai.getAllChiNgoais);
// Get By ID
router.get("/:id", ChiNgoai.getChiNgoaiById);
// Get By ID Dot
router.get("/id_dot/:id_dot", ChiNgoai.getChiNgoaiByIdDot);
// Create
router.post("/", ChiNgoai.createChiNgoai);
// Delete
router.delete("/:id", ChiNgoai.deleteChiNgoai);
// Get By MaNV
router.get("/salary/:ma_nv", ChiNgoai.getChiNgoaiByMaNV);
// Update
router.put("/:id", ChiNgoai.updateChiNgoai);
router.put("/savechingoai", ChiNgoai.saveChiNgoai);
// Update Status
// router.put("/status/:id", ChiNgoai.updateChiNgoaiStatus);

// Route để lấy Chi Ngoai đang hoạt động cho nhân viên
router.get("/active-chingoai/:maNV", ChiNgoai.getActiveChiNgoaiForEmployee);
router.get(
  "/active-chingoai-ql/:maNV",
  ChiNgoai.getActiveChiNgoaiForEmployeeQL
);
router.get(
  "/active-chingoai-sp/:maNV",
  ChiNgoai.getActiveChiNgoaiForEmployeeSP
);
module.exports = router;
