// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const PhongBan = require("../controllers/controller_phong_ban.js");

// Get All
router.get("/", PhongBan.getAllPhongBans);
router.get("/phongban-by-phutrach/:phu_trach", PhongBan.getPhongBanByPhuTrach);
// Get By ID
router.get("/:id", PhongBan.getPhongBanById);
// Create
router.post("/", PhongBan.createPhongBan);
// Delete
router.delete("/:id", PhongBan.deletePhongBan);
// Update
router.put("/:id", PhongBan.updatePhongBan);

module.exports = router;
