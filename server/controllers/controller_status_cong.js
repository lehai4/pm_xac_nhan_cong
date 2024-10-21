const StatusCong = require("../models/model_status_cong.js");
const moment = require("moment");

exports.getAllStatusCong = async (req, res) => {
  try {
    const statusCong = await StatusCong.getAllStatusCongs();
    res.status(200).json(statusCong);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStatusCong = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log(updatedData);

    // Validation
    if (!id || !updatedData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isUpdated = await StatusCong.updateStatusCong(id, updatedData);

    if (isUpdated) {
      // Optionally fetch and return the updated data
      const updatedStatusCong = await StatusCong.getStatusCongById(id);
      res.status(200).json({
        message: "StatusCong updated successfully",
        data: updatedStatusCong,
      });
    } else {
      res
        .status(404)
        .json({ error: "StatusCong not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating StatusCong:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.updateMultipleStatusCong = async (req, res) => {
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
          const isUpdated = await StatusCong.updateStatusCong(id, updateData);
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
    console.error("Error updating multiple StatusCong:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.getStatusCongById = async (req, res) => {
  try {
    // Chuyển đổi id từ chuỗi thành số nguyên
    const numericId = parseInt(req.params.id, 10);

    // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Gọi phương thức model để lấy dữ liệu
    const StatusCongData = await StatusCong.getStatusCongById(numericId);

    if (StatusCongData) {
      res.status(200).json(StatusCongData);
    } else {
      res.status(404).json({ error: "StatusCong not found" });
    }
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
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
      StatusCong.getStatusCongByStatusDone(dotId),
      StatusCong.getStatusCongByStatusComplaints(dotId),
      StatusCong.getStatusCongByStatusUpdateData(dotId),
      StatusCong.getStatusCongByStatusNoUpdateData(dotId),
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

exports.createStatusCong = async (req, res) => {
  try {
    console.log("body", req.body);
    const newStatusCongIds = await StatusCong.createStatusCongTonTai(req.body);
    res.status(201).json({ ids: newStatusCongIds });
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error ${error}` });
    console.log(error);
  }
};

exports.getStatusCongOutPage = async (req, res) => {
  try {
    const { id_dot, id_hst } = req.params;
    const StatusCongData = await StatusCong.getStatusCongOutPage(
      id_dot,
      id_hst
    );
    console.log("getStatusCongOutPage", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStatusCongOutPageGCGC = async (req, res) => {
  try {
    const { id_dot, id_gcgc } = req.params;
    const StatusCongData = await StatusCong.getStatusCongOutPageGCGC(
      id_dot,
      id_gcgc
    );
    console.log("getStatusCongOutPageGCGC", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusCongOutPageMain = async (req, res) => {
  try {
    const { id_dot, id_main } = req.params;
    const StatusCongData = await StatusCong.getStatusCongOutPageMain(
      id_dot,
      id_main
    );
    console.log("getStatusCongOutPageMain", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateStatusCongXinGiaHan = async (req, res) => {
  console.log("req.params", req.params);
  console.log("req.body", req.body);
  try {
    const { id_hst_gcgc_main, id_dot } = req.params; // Giả sử bạn đã thêm các tham số này vào đường dẫn URL
    const { xin_gia_han } = req.body;
    const isUpdated = await StatusCong.updateStatusCongXinGiaHan(
      id_hst_gcgc_main,
      id_dot,
      xin_gia_han
    );
    if (isUpdated) {
      res.status(200).json({ message: "StatusCong updated successfully" });
    } else {
      res
        .status(404)
        .json({ error: "StatusCong not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating xin_gia_han status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkExtensionRequested = async (req, res) => {
  const { id_hst_gcgc_main, id_dot } = req.params;
  try {
    const extensionStatus = await StatusCong.getExtensionStatus(
      id_hst_gcgc_main,
      id_dot
    );
    res.status(200).json({ hasRequestedExtension: extensionStatus });
  } catch (error) {
    console.error("Error checking extension request status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStatusCongComplaintsGCGC = async (req, res) => {
  try {
    const { id_dot, id_gcgc } = req.params;
    const StatusCongData = await StatusCong.getStatusCongComplaintsGCGC(
      id_dot,
      id_gcgc
    );
    console.log("getStatusCongComplaintsGCGC", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusCongComplaintsMain = async (req, res) => {
  try {
    const { id_dot, id_main } = req.params;
    const StatusCongData = await StatusCong.getStatusCongComplaintsMain(
      id_dot,
      id_main
    );
    console.log("getStatusCongComplaintsMain", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getStatusCongComplaints = async (req, res) => {
  try {
    const { id_dot, id_hst } = req.params;
    const StatusCongData = await StatusCong.getStatusCongComplaints(
      id_dot,
      id_hst
    );
    console.log("getStatusCongComplaints", StatusCongData);
    res.status(200).json(StatusCongData);
  } catch (error) {
    console.error("Error fetching StatusCong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteStatusCong = async (req, res) => {
  try {
    await StatusCong.deleteStatusCong(req.params.id);
    res.status(200).json({ message: "StatusCong deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
