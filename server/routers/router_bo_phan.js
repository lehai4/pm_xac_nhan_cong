// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const BoPhan = require("../controllers/controller_bo_phan.js");

// Get All
router.get("/", BoPhan.getAllBoPhans);
// Get By ID
router.get("/:id", BoPhan.getBoPhanById);

router.get("/bophan-by-phutrach/:id", BoPhan.getBoPhanByPhuTrach);
// Create
router.post("/", BoPhan.createBoPhan);
// Delete
router.delete("/:id", BoPhan.deleteBoPhan);
// Update
router.put("/:id", BoPhan.updateBoPhan);

module.exports = router;
