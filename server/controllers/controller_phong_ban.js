const PhongBan = require("../models/model_phong_ban.js");

exports.getAllPhongBans = async (req, res) => {
  try {
    const phongBans = await PhongBan.getAllPhongBans();
    res.status(200).json(phongBans);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePhongBan = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await PhongBan.updatePhongBan(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "PhongBan updated successfully" });
    } else {
      res.status(404).json({ error: "PhongBan not found" });
    }
  } catch (error) {
    console.error("Error updating PhongBan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPhongBanByPhuTrach = async (req, res) => {
  try {
    const { phu_trach } = req.params;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (!phu_trach) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const PhongBanData = await PhongBan.getAllPhongBansByPhuTrach(phu_trach);

    if (PhongBanData) {
      res.status(200).json(PhongBanData);
    } else {
      res.status(404).json({ error: "PhongBan not found" });
    }
  } catch (error) {
    console.error("Error fetching PhongBan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPhongBanById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const PhongBanData = await PhongBan.getPhongBanById(numericId);

    if (PhongBanData) {
      res.status(200).json(PhongBanData);
    } else {
      res.status(404).json({ error: "PhongBan not found" });
    }
  } catch (error) {
    console.error("Error fetching PhongBan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createPhongBan = async (req, res) => {
  try {
    const newPhongBanId = await PhongBan.createPhongBan(req.body);
    res.status(201).json({ id: newPhongBanId });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deletePhongBan = async (req, res) => {
  try {
    await PhongBan.deletePhongBan(req.params.id);
    res.status(200).json({ message: "PhongBan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
