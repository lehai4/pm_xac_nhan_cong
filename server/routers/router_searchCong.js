const express = require("express");
const router = express.Router();

const congController = require("../controllers/controller_searchCong");

router.get("/search", congController.searchCong);
router.get("/search-by-tt/:phutrach", congController.getCongsByTT);
router.get("/search-by-ql/:phutrach", congController.getCongsByQL);
router.get(
  "/search-by-tt-id/:bang_cong_t/:id_bo_phan",
  congController.getCongsTTByIDNV
);
router.get(
  "/search-by-ql-id/:bang_cong_t/:phutrach",
  congController.getCongsQLByIDNV
);
router.get("/complaint-details-hst", congController.getComplaintDetailsHST);
router.get("/complaint-details-gcgc", congController.getComplaintDetailsGCGC);
router.get("/complaint-details-main", congController.getComplaintDetailsMain);

router.get("/status/:dotId/:id/:type/:status", congController.getCongStatusOLD); // Cập nhật route để sử dụng hàm mới

router.get("/cong-status/ttandql", congController.getCongDetails);
module.exports = router;
