// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const Role = require("../controllers/controller_role.js");

// Get All
router.get("/", Role.getAllRoles);
// Get By ID
router.get("/:id", Role.getRoleById);
// Create
router.post("/", Role.createRole);
// Delete
router.delete("/:id", Role.deleteRole);
// Update
router.put("/:id", Role.updateRole);

module.exports = router;
