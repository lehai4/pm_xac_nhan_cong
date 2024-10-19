const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/controller_searchSalary");

router.get("/search", salaryController.searchSalary);
router.get("/search-by-tt/:phutrach", salaryController.getSalarysByTT);
router.get("/search-by-ql/:phutrach", salaryController.getSalarysByQL);
router.get(
  "/search-by-tt-id/:bang_luong_t/:id_bo_phan",
  salaryController.getSalarysTTByIDNV
);
router.get(
  "/search-by-ql-id/:bang_luong_t/:phutrach",
  salaryController.getSalarysQLByIDNV
);
router.get("/complaint-details-ct", salaryController.getComplaintDetailsCT);
router.get("/complaint-details-cn", salaryController.getComplaintDetailsCN);

router.get(
  "/status/:dotId/:id/:type/:status",
  salaryController.getSalaryStatusOLD
); // Cập nhật route để sử dụng hàm mới

router.get("/salary-status/ttandql", salaryController.getSalaryDetails);
module.exports = router;
