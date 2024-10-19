const ChiNgoai = require("../models/model_chi_ngoai.js");
const DotLuong = require("../models/model_dot_luong.js");
const PhanQuyenSalary = require("../models/model_phan_quyen.js");

exports.getAllChiNgoais = async (req, res) => {
  try {
    const chiNgoais = await ChiNgoai.getAllChiNgoais();
    res.status(200).json(chiNgoais);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateChiNgoai = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const isUpdated = await ChiNgoai.updateChiNgoai(id, updatedData);

    if (isUpdated) {
      res.status(200).json({ message: "ChiNgoai updated successfully" });
    } else {
      res.status(404).json({ error: "ChiNgoai not found" });
    }
  } catch (error) {
    console.error("Error updating ChiNgoai:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiNgoaiById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const chiNgoaiData = await ChiNgoai.getChiNgoaiById(numericId);

    if (chiNgoaiData) {
      res.status(200).json(chiNgoaiData);
    } else {
      res.status(404).json({ error: "ChiNgoai not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiNgoai:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiNgoaiByIdDot = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericIdDot = req.params.id_dot;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericIdDot)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const ChiNgoaiData = await ChiNgoai.getChiNgoaiByIdDot(numericIdDot);

    if (ChiNgoaiData) {
      res.status(200).json(ChiNgoaiData);
    } else {
      res.status(404).json({ error: "ChiNgoai not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiNgoai:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChiNgoaiByMaNV = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericMa_nv = req.params.ma_nv;

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericMa_nv)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const ChiNgoaiData = await ChiNgoai.getChiNgoaiByMaMV(numericMa_nv);

    if (ChiNgoaiData) {
      res.status(200).json(ChiNgoaiData);
    } else {
      res.status(404).json({ error: "ChiNgoai not found" });
    }
  } catch (error) {
    console.error("Error fetching ChiNgoai:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.saveChiNgoai = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const { data, id_dot } = req.body;
    const result = await ChiNgoai.updateChiNgoaiArray(data, id_dot);
    res.status(200).json({
      message: "Quá trình cập nhật dữ liệu Chi Ngoài đã hoàn tất",
      success: result,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu Chi Ngoài:", error);
    res.status(500).json({
      error: "Đã xảy ra lỗi khi cập nhật dữ liệu",
      details: error.message,
    });
  }
};

exports.getActiveChiNgoaiForEmployee = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiNgoai = await ChiNgoai.getActiveChiNgoaiForEmployee(maNV);
    if (activeChiNgoai.length > 0) {
      res.json(activeChiNgoai);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getActiveChiNgoaiForEmployeeQL = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiNgoai = await ChiNgoai.getActiveChiNgoaiForEmployeeQL(maNV);
    if (activeChiNgoai.length > 0) {
      res.json(activeChiNgoai);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getActiveChiNgoaiForEmployeeSP = async (req, res) => {
  try {
    const { maNV } = req.params;
    const activeChiNgoai = await ChiNgoai.getActiveChiNgoaiForEmployeeSP(maNV);
    if (activeChiNgoai.length > 0) {
      res.json(activeChiNgoai);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateChiNgoaiStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;
    const updated = await ChiNgoai.updateTrangThai(id, trangThai);
    if (updated) {
      res.json({ message: "Cập nhật trạng thái thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.createChiNgoai = async (req, res) => {
  try {
    // Kiểm tra nếu req.body.dotLuong là một mảng và chiNgoai là một mảng
    if (!Array.isArray(req.body.ChiNgoai)) {
      return res
        .status(400)
        .json({ error: "Dữ liệu chiNgoai phải là một mảng" });
    }

    // Tạo đợt lương và lấy ID
    const dotLuongId = await DotLuong.createDotLuong(req.body.dotLuong);

    // Tạo chi tiết chi ngoài với ID đợt lương
    const ChiNgoaiId = await ChiNgoai.createChiNgoai(
      req.body.ChiNgoai, // Đảm bảo đúng tên trường
      dotLuongId
    );

    const phanQuyenSalarys = await PhanQuyenSalary.addMutiPhanQuyenSalary(
      req.body.phanQuyenSalary,
      dotLuongId
    );
    res.status(201).json({
      iddotluong: dotLuongId,
      idChiNgoai: ChiNgoaiId,
      idPhanQuyenSalary: phanQuyenSalarys,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

exports.deleteChiNgoai = async (req, res) => {
  try {
    await ChiNgoai.deleteChiNgoai(req.params.id);
    res.status(200).json({ message: "ChiNgoai deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
