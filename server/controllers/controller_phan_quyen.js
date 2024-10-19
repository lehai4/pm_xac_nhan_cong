const PhanQuyen = require("../models/model_phan_quyen.js");

exports.getAllPhanQuyens = async (req, res) => {
  try {
    const phanQuyens = await PhanQuyen.getAllPhanQuyens();
    res.status(200).json(phanQuyens);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePhanQuyen = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await PhanQuyen.updatePhanQuyen(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "PhanQuyen updated successfully" });
    } else {
      res.status(404).json({ error: "PhanQuyen not found" });
    }
  } catch (error) {
    console.error("Error updating PhanQuyen:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPhanQuyenById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const PhanQuyenData = await PhanQuyen.getPhanQuyenById(numericId);

    if (PhanQuyenData) {
      res.status(200).json(PhanQuyenData);
    } else {
      res.status(404).json({ error: "PhanQuyen not found" });
    }
  } catch (error) {
    console.error("Error fetching PhanQuyen:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createPhanQuyen = async (req, res) => {
  try {
    const newPhanQuyenId = await PhanQuyen.createPhanQuyen(req.body);
    res.status(201).json({ id: newPhanQuyenId });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deletePhanQuyen = async (req, res) => {
  try {
    await PhanQuyen.deletePhanQuyen(req.params.id);
    res.status(200).json({ message: "PhanQuyen deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
