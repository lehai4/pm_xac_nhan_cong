const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/controller_Dashboard");

router.get(
  "/get-chi-trong-by-dot-id/:dotId",
  dashboardController.getChiTrongByDotId
);
router.get(
  "/get-chi-ngoai-by-dot-id/:dotId",
  dashboardController.getChiNgoaiByDotId
);

module.exports = router;
