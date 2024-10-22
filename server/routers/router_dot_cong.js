const express = require("express");
const router = express.Router();

const DotCong = require("../controllers/controller_dot_cong");

//custom
router.post("/getall", DotCong.getAllCongMains);

// Get By ID
router.get("/:id", DotCong.getDotCongById);

router.get("/", DotCong.getAllDotCongs);

// Get By Month
router.get("/month/:month", DotCong.getDotCongByMonth);

// Get By Month No Active
router.get("/month-no-active/:month", DotCong.getDotCongByMonthNoActive);

// Get By Period Name
router.get("/periodName/:periodName", DotCong.getDotCongByPeriodName);

// Get By ID Dot
router.get("/he-so-thuong/id_dot/:id_dot", DotCong.getHSTByIdDot);
// Get By ID Dot
router.get("/gio-cong-gian-ca/id_dot/:id_dot", DotCong.getGCGCByIdDot);
// Create
//create hệ số thưởng
router.post("/he-so-thuong", DotCong.createHeSoThuong);

//create gio cong gian ca
router.post("/gio-cong-gian-ca", DotCong.createGioCongGianCa);

//create dot-cong-chinh
router.post("/bang-cong-chinh", DotCong.createBangCongChinh);

//put
router.put("/active/update-is-active", DotCong.updateIsActive);
// Update
router.put("/save-hst", DotCong.saveHST);
router.put("/save-gcgc", DotCong.saveGCGC);
router.put("/:id", DotCong.updateDotCong);

router.get("/active-he-so-thuong-ql/:maNV", DotCong.getActiveHSTForEmployeeQL);
router.get(
  "/active-gio-cong-gian-ca-ql/:maNV",
  DotCong.getActiveGCGCForEmployeeQL
);
router.get(
  "/active-gio-cong-main-ql/:maNV",
  DotCong.getActiveMainForEmployeeQL
);
// có body
router.post(
  "/active-he-so-thuong-sp/:maNV",
  DotCong.getActiveHeSoThuongForEmployeeSP
);

router.post(
  "/active-gio-cong-gian-ca-sp/:maNV",
  DotCong.getActiveGCGCForEmployeeSP
);

router.post(
  "/active-cong-main-sp/:maNV",
  DotCong.getActiveCongMainForEmployeeSP
);
// không body
router.get(
  "/active-he-so-thuong-spp/:maNV",
  DotCong.getActiveHeSoThuongForEmployeeSPP
);

router.get(
  "/active-gio-cong-gian-ca-spp/:maNV",
  DotCong.getActiveGCGCForEmployeeSPP
);

router.get(
  "/active-cong-main-spp/:maNV",
  DotCong.getActiveCongMainForEmployeeSPP
);

module.exports = router;
