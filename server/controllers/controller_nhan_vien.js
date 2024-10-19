const NhanVien = require("../models/model_nhan_vien.js");

exports.getAllNhanViens = async (req, res) => {
  try {
    const nhanViens = await NhanVien.getAllNhanViens();
    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getAllNhanViensByLimit = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const searchTerm = req.query.search || "";

    const result = await NhanVien.getAllNhanVienByLimit(
      page,
      limit,
      searchTerm
    );

    res.status(200).json({
      nhanViens: result.nhanViens,
      currentPage: page,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (error) {
    console.error("Error in getAllNhanViensByLimit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNhanVienByMaNV = async (req, res) => {
  try {
    const nhanViens = await NhanVien.getNhanVienByMaNV(req.params.ma_nv);
    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNhanVienByMaNVLike = async (req, res) => {
  try {
    const nhanViens = await NhanVien.getNhanVienByMaNVLike(req.params.ma_nv);
    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNhanVienByAdmin = async (req, res) => {
  try {
    const nhanViens = await NhanVien.getNhanVienByMaNV(req.params.ma_nv);
    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateNhanVien = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await NhanVien.updateNhanVien(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "NhanVien updated successfully" });
    } else {
      res.status(404).json({ error: "NhanVien not found" });
    }
  } catch (error) {
    console.error("Error updating NhanVien:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNhanVienById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const NhanVienData = await NhanVien.getNhanVienById(numericId);

    if (NhanVienData) {
      res.status(200).json(NhanVienData);
    } else {
      res.status(404).json({ error: "NhanVien not found" });
    }
  } catch (error) {
    console.error("Error fetching NhanVien:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createNhanVien = async (req, res) => {
  try {
    const newNhanVienId = await NhanVien.createNhanVien(req.body);
    res.status(201).json({ id: newNhanVienId });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

exports.deleteNhanVien = async (req, res) => {
  try {
    await NhanVien.deleteNhanVien(req.params.id);
    res.status(200).json({ message: "NhanVien deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
