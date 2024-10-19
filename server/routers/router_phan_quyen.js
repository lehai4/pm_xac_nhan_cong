// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const PhanQuyen = require("../controllers/controller_phan_quyen.js");
const PhanQuyenSalary = require("../controllers/controller_PhanQuyenSalary.js");
const PhanQuyenDotCong = require("../controllers/controller_PhanQuyenDotCong.js");
// Get All
router.get("/", PhanQuyen.getAllPhanQuyens);
// Get By ID
router.get("/:id", PhanQuyen.getPhanQuyenById);
// Create
router.post("/", PhanQuyen.createPhanQuyen);
// Delete
router.delete("/:id", PhanQuyen.deletePhanQuyen);
// Update
router.put("/:id", PhanQuyen.updatePhanQuyen);

// Get Phan Quyen Salary
router.get("/phongban/phan-quyen-salary", PhanQuyenSalary.getPhanQuyenSalary);
// Get Phan Quyen Salary By ID Dot
router.get(
  "/phongban/phan-quyen-salary/:id_dot",
  PhanQuyenSalary.getPhanQuyenSalaryByIdDot
);

// Update Phan Quyen Salary
router.put(
  "/phongban/phan-quyen-salary/:id_dot",
  PhanQuyenSalary.updatePhanQuyenSalary
);

// Get Phan Quyen DotCong
router.get(
  "/phongban/phan-quyen-dot-cong",
  PhanQuyenDotCong.getPhanQuyenWorkHours
);
// Get Phan Quyen DotCong By ID Dot
router.get(
  "/phongban/phan-quyen-dot-cong/:id_dot",
  PhanQuyenDotCong.getPhanQuyenWorkHoursByIdDot
);
// Update Phan Quyen DotCongByID
router.put(
  "/phongban/phan-quyen-dot-cong/:id_dot",
  PhanQuyenDotCong.updatePhanQuyenWorkHours
);
module.exports = router;
