const ChiTrong = require("../models/model_chi_trong.js");
const DotLuong = require("../models/model_dot_luong.js");
const PhanQuyenSalary = require("../models/model_phan_quyen.js");
exports.getAllChiTrongs = async (req, res) => {
  try {
    const ChiTrongs = await ChiTrong.getAllChiTrongs();
    res.status(200).json(ChiTrongs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiTrongById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const ChiTrongData = await ChiTrong.getChiTrongById(numericId);

    if (ChiTrongData) {
      res.status(200).json(ChiTrongData);
    } else {
      res.status(404).json({ error: "ChiTrong not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiTrong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiTrongByIdDot = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericIdDot = req.params.id_dot;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericIdDot)) {
      return res.status(400).json({ error: "Invalid ID Dot format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const ChiTrongData = await ChiTrong.getChiTrongByIdDot(numericIdDot);

    if (ChiTrongData) {
      res.status(200).json(ChiTrongData);
    } else {
      res.status(404).json({ error: "ChiTrong not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiTrong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiTrongByMaNV = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericMa_nv = req.params.ma_nv;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericMa_nv)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const ChiTrongData = await ChiTrong.getChiTrongByMaMV(numericMa_nv);

    if (ChiTrongData) {
      res.status(200).json(ChiTrongData);
    } else {
      res.status(404).json({ error: "ChiTrong not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiTrong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createChiTrong = async (req, res) => {
  try {
    // Tạo đợt lương và lấy ID
    const dotLuongId = await DotLuong.createDotLuong(req.body.dotLuong);

    // Tạo chi tiết chi trong với ID đợt lương
    const chiTrongId = await ChiTrong.createChiTrong(
      req.body.chiTrong,
      dotLuongId
    );

    const phanQuyenSalarys = await PhanQuyenSalary.addMutiPhanQuyenSalary(
      req.body.phanQuyenSalary,
      dotLuongId
    );

    res.status(201).json({
      iddotluong: dotLuongId,
      idChitrong: chiTrongId,
      idPhanQuyenSalary: phanQuyenSalarys,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

exports.saveChiTrong = async (req, res) => {
  try {
    // console.log("Received in controller - entire req.body:", req.body);
    const { data, id_dot } = req.body;

    // console.log("id_dot to be sent to model:", id_dot);

    const result = await ChiTrong.updateChiTrong(data, id_dot);

    res.status(200).json({
      message: "Quá trình cập nhật dữ liệu Chi Trong đã hoàn tất",
      success: result.success,
      lastModified: result.lastModified,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu Chi Trong:", error);
    res.status(500).json({
      error: "Đã xảy ra lỗi khi cập nhật dữ liệu",
      details: error,
    });
  }
};

exports.updateChiTrongStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;
    const updated = await ChiTrong.updateTrangThai(id, trangThai);
    if (updated) {
      res.json({ message: "Cập nhật trạng thái thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getActiveChiTrongForEmployee = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiTrong = await ChiTrong.getActiveChiTrongForEmployee(maNV);
    if (activeChiTrong.length > 0) {
      res.json(activeChiTrong);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getActiveChiTrongForEmployeeSP = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiTrong = await ChiTrong.getActiveChiTrongForEmployeeSP(maNV);
    if (activeChiTrong.length > 0) {
      res.json(activeChiTrong);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getActiveChiTrongForEmployeeQL = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiTrong = await ChiTrong.getActiveChiTrongForEmployeeQL(maNV);
    if (activeChiTrong.length > 0) {
      res.json(activeChiTrong);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.deleteChiTrong = async (req, res) => {
  try {
    await ChiTrong.deleteChiTrong(req.params.id);
    res.status(200).json({ message: "ChiTrong deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
