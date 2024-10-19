const BoPhan = require("../models/model_bo_phan.js");

exports.getAllBoPhans = async (req, res) => {
  try {
    const boPhans = await BoPhan.getAllBoPhans();
    res.status(200).json(boPhans);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateBoPhan = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await BoPhan.updateBoPhan(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "BoPhan updated successfully" });
    } else {
      res.status(404).json({ error: "BoPhan not found" });
    }
  } catch (error) {
    console.error("Error updating BoPhan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getBoPhanByPhuTrach = async (req, res) => {
  try {
    const numericId = req.params.id;
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const boPhanData = await BoPhan.getBoPhanByPhuTrach(numericId);
    res.status(200).json(boPhanData);
  } catch (error) {
    console.error("Error fetching BoPhan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getBoPhanById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const boPhanData = await BoPhan.getBoPhanById(numericId);

    if (boPhanData) {
      res.status(200).json(boPhanData);
    } else {
      res.status(404).json({ error: "BoPhan not found" });
    }
  } catch (error) {
    console.error("Error fetching BoPhan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createBoPhan = async (req, res) => {
  console.log(req.body);
  try {
    const newboPhanIds = await BoPhan.createBoPhan(req.body);
    res.status(201).json({ ids: newboPhanIds });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

exports.deleteBoPhan = async (req, res) => {
  try {
    await BoPhan.deleteBoPhan(req.params.id);
    res.status(200).json({ message: "BoPhan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
