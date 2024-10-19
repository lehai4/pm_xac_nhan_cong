const StatusLuong = require("../models/model_status_luong.js");
const moment = require("moment");

exports.getAllStatusLuong = async (req, res) => {
  try {
    const StatusLuong = await StatusLuong.getAllStatusLuong();
    res.status(200).json(StatusLuong);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStatusLuong = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log(updatedData);

    // Validation
    if (!id || !updatedData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isUpdated = await StatusLuong.updateStatusLuong(id, updatedData);

    if (isUpdated) {
      // Optionally fetch and return the updated data
      const updatedStatusLuong = await StatusLuong.getStatusLuongById(id);
      res.status(200).json({
        message: "StatusLuong updated successfully",
        data: updatedStatusLuong,
      });
    } else {
      res
        .status(404)
        .json({ error: "StatusLuong not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating StatusLuong:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.updateMultipleStatusLuong = async (req, res) => {
  try {
    const updatedDataArray = req.body;

    if (!Array.isArray(updatedDataArray) || updatedDataArray.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    console.log("updatedDataArray", updatedDataArray);

    const updateResults = await Promise.all(
      updatedDataArray.map(async (item) => {
        const { id, tinh_trang, tinh_trang_ns_khieu_nai } = item;
        if (
          !id ||
          typeof id !== "number" ||
          (!tinh_trang && !tinh_trang_ns_khieu_nai)
        ) {
          return { id, success: false, error: "Invalid data" };
        }
        try {
          const updateData = tinh_trang
            ? { tinh_trang }
            : { tinh_trang_ns_khieu_nai };
          const isUpdated = await StatusLuong.updateStatusLuong(id, updateData);
          return { id, success: isUpdated };
        } catch (error) {
          console.log(error);
          console.error(`Error updating status for ID ${id}:`, error);
          return { id, success: false, error: error.message };
        }
      })
    );

    const successCount = updateResults.filter(
      (result) => result.success
    ).length;
    const failCount = updateResults.length - successCount;

    res.status(200).json({
      message: `Cập nhật thành công ${successCount} bản ghi, thất bại ${failCount} bản ghi`,
      results: updateResults,
    });
  } catch (error) {
    console.error("Error updating multiple StatusLuong:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.getStatusLuongById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const StatusLuongData = await StatusLuong.getStatusLuongById(numericId);

    if (StatusLuongData) {
      res.status(200).json(StatusLuongData);
    } else {
      res.status(404).json({ error: "StatusLuong not found" });
    }
  } catch (error) {
    console.error("Error fetching StatusLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  const dotId = req.params.dotId;

  try {
    const [
      doneSalaries,
      complaintSalariesDone,
      updateDataSalaries,
      noUpdateDataSalaries,
    ] = await Promise.all([
      StatusLuong.getStatusLuongByStatusDone(dotId),
      StatusLuong.getStatusLuongByStatusComplaints(dotId),
      StatusLuong.getStatusLuongByStatusUpdateData(dotId),
      StatusLuong.getStatusLuongByStatusNoUpdateData(dotId),
    ]);

    res.status(200).json({
      doneSalariesCount: doneSalaries.length,
      complaintSalariesCount: complaintSalariesDone.length,
      updateDataSalariesCount: updateDataSalaries.length,
      noUpdateDataSalariesCount: noUpdateDataSalaries.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê dashboard:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.createStatusLuong = async (req, res) => {
  try {
    const newStatusLuongIds = await StatusLuong.createStatusLuongTonTai(
      req.body
    );
    res.status(201).json({ ids: newStatusLuongIds });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error ${error}` });
    console.log(error);
  }
};

exports.getStatusLuongOutPage = async (req, res) => {
  try {
    const { id_dot, id_trong } = req.params;
    const StatusLuongData = await StatusLuong.getStatusLuongOutPage(
      id_dot,
      id_trong
    );
    console.log(StatusLuongData);
    res.status(200).json(StatusLuongData);
  } catch (error) {
    console.error("Error fetching StatusLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStatusLuongOutPageCN = async (req, res) => {
  try {
    const { id_dot, id_ngoai } = req.params;
    const StatusLuongData = await StatusLuong.getStatusLuongOutPageCN(
      id_dot,
      id_ngoai
    );
    console.log(StatusLuongData);
    res.status(200).json(StatusLuongData);
  } catch (error) {
    console.error("Error fetching StatusLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStatusLuongXinGiaHan = async (req, res) => {
  console.log("req.params", req.params);
  console.log("req.body", req.body);
  try {
    const { id_trong_ngoai, id_dot } = req.params; // Giả sử bạn đã thêm các tham số này vào đường dẫn URL
    const { xin_gia_han } = req.body;
    const isUpdated = await StatusLuong.updateStatusLuongXinGiaHan(
      id_trong_ngoai,
      id_dot,
      xin_gia_han
    );
    if (isUpdated) {
      res.status(200).json({ message: "StatusLuong updated successfully" });
    } else {
      res
        .status(404)
        .json({ error: "StatusLuong not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating xin_gia_han status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkExtensionRequested = async (req, res) => {
  const { id_trong_ngoai, id_dot } = req.params;
  try {
    const extensionStatus = await StatusLuong.getExtensionStatus(
      id_trong_ngoai,
      id_dot
    );
    res.status(200).json({ hasRequestedExtension: extensionStatus });
  } catch (error) {
    console.error("Error checking extension request status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStatusLuongComplaintsCN = async (req, res) => {
  try {
    const { id_dot, id_ngoai } = req.params;
    const StatusLuongData = await StatusLuong.getStatusLuongComplaintsCN(
      id_dot,
      id_ngoai
    );
    console.log(StatusLuongData);
    res.status(200).json(StatusLuongData);
  } catch (error) {
    console.error("Error fetching StatusLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStatusLuongComplaints = async (req, res) => {
  try {
    const { id_dot, id_trong } = req.params;
    const StatusLuongData = await StatusLuong.getStatusLuongComplaints(
      id_dot,
      id_trong
    );
    console.log(StatusLuongData);
    res.status(200).json(StatusLuongData);
  } catch (error) {
    console.error("Error fetching StatusLuong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteStatusLuong = async (req, res) => {
  try {
    await StatusLuong.deleteStatusLuong(req.params.id);
    res.status(200).json({ message: "StatusLuong deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
