// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const DotLuong = require("../controllers/controller_dot_luong.js");

// Get All
router.get("/", DotLuong.getAllDotLuongs);
// Get By ID
router.get("/:id", DotLuong.getDotLuongById);
// Get By Period Name
router.get("/periodName/:periodName", DotLuong.getDotLuongByPeriodName);
// Create
router.post("/", DotLuong.createDotLuong);
// Delete
router.delete("/:id", DotLuong.deleteDotLuong);
// Update
router.put("/:id", DotLuong.updateDotLuong);
router.put("/complain/:id", DotLuong.updateDotLuongComplain);
// Route để cập nhật is_Active
router.put("/active/update-is-active", DotLuong.updateIsActive);
// Get By Month
router.get("/month/:month", DotLuong.getDotLuongByMonth);
// Get By Month No Active
router.get("/month-no-active/:month", DotLuong.getDotLuongByMonthNoActive);

module.exports = router;
