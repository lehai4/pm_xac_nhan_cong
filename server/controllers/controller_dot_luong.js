const DotLuong = require("../models/model_dot_luong.js");

exports.getAllDotLuongs = async (req, res) => {
  try {
    const DotLuongs = await DotLuong.getAllDotLuongs();
    res.status(200).json(DotLuongs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDotLuong = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body.dotLuong;
    const isUpdated = await DotLuong.updateDotLuong(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "DotLuong updated successfully" });
    } else {
      res.status(404).json({ error: "DotLuong not found" });
    }
  } catch (error) {
    console.error("Error updating DotLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDotLuongComplain = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await DotLuong.updateDotLuong(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "DotLuong updated successfully" });
    } else {
      res.status(404).json({ error: "DotLuong not found" });
    }
  } catch (error) {
    console.error("Error updating DotLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDotLuongByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const DotLuongData = await DotLuong.getDotLuongByMonth(month);
    res.status(200).json(DotLuongData);
  } catch (error) {
    console.error("Error fetching DotLuong by month:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDotLuongByMonthNoActive = async (req, res) => {
  try {
    const { month } = req.params;
    const DotLuongData = await DotLuong.getDotLuongByMonthNoActive(month);
    res.status(200).json(DotLuongData);
  } catch (error) {
    console.error("Error fetching DotLuong by month:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDotLuongByPeriodName = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericPeriodName = req.params.periodName;
    // Gọi phương thức model để lấy dữ liệu
    const DotLuongData = await DotLuong.getDotLuongByPeriodName(
      numericPeriodName
    );
    if (DotLuongData) {
      res.status(200).json(DotLuongData);
    } else {
      res.status(404).json({ error: "DotLuong not found" });
    }
  } catch (error) {
    console.error("Error fetching DotLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDotLuongById = async (req, res) => {
  // console.log("req.params.id", req.params.id);
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const DotLuongData = await DotLuong.getDotLuongById(numericId);

    if (DotLuongData) {
      res.status(200).json(DotLuongData);
    } else {
      res.status(404).json({ error: "DotLuong not found" });
    }
  } catch (error) {
    console.error("Error fetching DotLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createDotLuong = async (req, res) => {
  try {
    const newDotLuongIds = await DotLuong.createDotLuong(req.body);
    res.status(201).json({ ids: newDotLuongIds });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};

exports.updateIsActive = async (req, res) => {
  try {
    const dotLuongUpdates = req.body;
    await DotLuong.updateIsActive(dotLuongUpdates);
    res.status(200).json({ message: "DotLuong updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteDotLuong = async (req, res) => {
  try {
    await DotLuong.deleteDotLuong(req.params.id);
    res.status(200).json({ message: "DotLuong deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
