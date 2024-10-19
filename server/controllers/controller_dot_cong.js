const DotCong = require("../models/model_dot_cong");
const PhanQuyen = require("../models/model_phan_quyen.js");
const moment = require("moment");
const dotCongController = {
  getAllDotCongs: async (req, res) => {
    try {
      const DotCongs = await DotCong.getAllDotCongs();
      res.status(200).json(DotCongs);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAllCongMains: async (req, res) => {
    try {
      // console.log("req.body.bang_cong_t", req.body.bang_cong_t);
      const CongMain = await DotCong.getAllCongMains(req.body.bang_cong_t);
      // console.log("CongMain", CongMain);

      return res.status(200).json(CongMain);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getDotCongById: async (req, res) => {
    try {
      // Chuyển đổi id từ chuỗi thành số nguyên
      const numericId = parseInt(req.params.id, 10);

      // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
      if (isNaN(numericId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Gọi phương thức model để lấy dữ liệu
      const DotCongData = await DotCong.getDotCongById(numericId);

      if (DotCongData) {
        res.status(200).json(DotCongData);
      } else {
        res.status(404).json({ error: "DotCong not found" });
      }
    } catch (error) {
      console.error("Error fetching DotCong:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getDotCongByMonth: async (req, res) => {
    try {
      const { month } = req.params;
      const DotCongData = await DotCong.getDotCongByMonth(month);
      res.status(200).json(DotCongData);
    } catch (error) {
      console.error("Error fetching DotCong by month:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getDotCongByMonthNoActive: async (req, res) => {
    try {
      const { month } = req.params;
      const DotCongData = await DotCong.getDotCongByMonthNoActive(month);
      res.status(200).json(DotCongData);
    } catch (error) {
      console.error("Error fetching DotCong by month:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getDotCongByPeriodName: async (req, res) => {
    try {
      // Chuyển đổi id từ chuỗi thành số nguyên
      const numericPeriodName = req.params.periodName;
      // Gọi phương thức model để lấy dữ liệu
      const DotCongData = await DotCong.getDotCongByPeriodName(
        numericPeriodName
      );
      if (DotCongData) {
        res.status(200).json(DotCongData);
      } else {
        res.status(404).json({ error: "DotCong not found" });
      }
    } catch (error) {
      console.error("Error fetching DotCong:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getHSTByIdDot: async (req, res) => {
    try {
      // Chuyển đổi id từ chuỗi thành số nguyên
      const numericIdDot = req.params.id_dot;

      // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
      if (isNaN(numericIdDot)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Gọi phương thức model để lấy dữ liệu
      const HeSoThuongData = await DotCong.getHSTByIdDot(numericIdDot);

      if (HeSoThuongData) {
        res.status(200).json(HeSoThuongData);
      } else {
        res.status(404).json({ error: "ChiNgoai not found" });
      }
    } catch (error) {
      console.error("Error fetching ChiNgoai:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getGCGCByIdDot: async (req, res) => {
    try {
      // Chuyển đổi id từ chuỗi thành số nguyên
      const numericIdDot = req.params.id_dot;

      // Kiểm tra nếu chuyển đổi không thành công thì trả về lỗi 400
      if (isNaN(numericIdDot)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Gọi phương thức model để lấy dữ liệu
      const ChiNgoaiData = await DotCong.getGCGCByIdDot(numericIdDot);

      if (ChiNgoaiData) {
        res.status(200).json(ChiNgoaiData);
      } else {
        res.status(404).json({ error: "ChiNgoai not found" });
      }
    } catch (error) {
      console.error("Error fetching ChiNgoai:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createHeSoThuong: async (req, res) => {
    try {
      const { dotCong, name, phanQuyenDotCong } = req.body;

      // Tạo đợt công và lấy ID
      const dotCongId = await DotCong.createDotCong(dotCong);

      // Tạo chi tiết hesoThuong với ID đợt dotCong
      await DotCong.createTableHeSoThuong(name, dotCongId);

      const phanQuyenDotCongs = await PhanQuyen.addMutiPhanQuyenDotCong(
        phanQuyenDotCong,
        dotCongId
      );

      return res.status(201).json({
        idDotCong: dotCongId,
        idPhanQuyenDotCong: phanQuyenDotCongs,
        message: "Tạo thành công!",
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createGioCongGianCa: async (req, res) => {
    try {
      const { dotCong, name, phanQuyenDotCong } = req.body;

      // Tạo đợt công và lấy ID
      const dotCongId = await DotCong.createDotCong(dotCong);

      // Tạo chi tiết gioconggianca với ID đợt dotCong
      await DotCong.createTableGioCongGianCa(name, dotCongId);

      const phanQuyenDotCongs = await PhanQuyen.addMutiPhanQuyenDotCong(
        phanQuyenDotCong,
        dotCongId
      );

      return res.status(201).json({
        idDotCong: dotCongId,
        idPhanQuyenDotCong: phanQuyenDotCongs,
        message: "Tạo thành công!",
      });
    } catch (error) {
      console.error("Error create gioconggianca:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createBangCongChinh: async (req, res) => {
    try {
      const { dotCong, phanQuyenDotCong } = req.body;

      const dotCongId = await DotCong.createDotCong(dotCong);

      console.log("DotCongId", dotCongId);
      console.log("dotCong", dotCong[0]);
      // Tạo chi tiết bangcongchinhtheothang với ID đợt dotCong
      await DotCong.createTableBangCongChinh(dotCong[0].bang_cong_t, dotCongId);

      const phanQuyenDotCongs = await PhanQuyen.addMutiPhanQuyenDotCong(
        phanQuyenDotCong,
        dotCongId
      );

      return res.status(201).json({
        idDotCong: dotCongId,
        idPhanQuyenDotCong: phanQuyenDotCongs,
        message: "Tạo thành công!",
      });
    } catch (error) {
      console.error("Error create BangCongChinh:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateIsActive: async (req, res) => {
    try {
      const dotCongUpdates = req.body;
      console.log("dotCongUpdates", dotCongUpdates);
      await DotCong.updateIsActive(dotCongUpdates);
      res.status(200).json({ message: "DotCong updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateDotCong: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body.dotCong;

      const isUpdated = await DotCong.updateCong(id, updatedData);

      if (isUpdated) {
        res.status(200).json({ message: "DotCong updated successfully" });
      } else {
        res.status(404).json({ error: "DotCong not found" });
      }
    } catch (error) {
      console.error("Error updating DotCong:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  saveHST: async (req, res) => {
    try {
      const { data, id_dot } = req.body;
      const result = await DotCong.updateHSTArray(data, id_dot);
      return res.status(200).json({
        message: "Quá trình cập nhật dữ liệu Hệ Số Thưởng đã hoàn tất",
        success: result,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu Hệ Số Thưởng:", error);
      return res.status(500).json({
        error: "Đã xảy ra lỗi khi cập nhật dữ liệu",
        details: error.message,
      });
    }
  },

  saveGCGC: async (req, res) => {
    try {
      const { data, id_dot } = req.body;
      const result = await DotCong.updateGCGCArray(data, id_dot);
      res.status(200).json({
        message: "Quá trình cập nhật dữ liệu Giờ Công Giãn Ca đã hoàn tất",
        success: result,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu Giờ Công Giãn Ca:", error);
      res.status(500).json({
        error: "Đã xảy ra lỗi khi cập nhật dữ liệu",
        details: error.message,
      });
    }
  },

  //get có body
  getActiveHeSoThuongForEmployeeSP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeHeSoThuong = await DotCong.getActiveHeSoThuongForEmployeeSP(
        maNV,
        moment(req.body.month).format("MM-YYYY")
      );
      if (activeHeSoThuong.length > 0) {
        res.json(activeHeSoThuong);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getActiveGCGCForEmployeeSP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeGCGC = await DotCong.getActiveGCGCForEmployeeSP(
        maNV,
        moment(req.body.month).format("MM-YYYY")
      );
      if (activeGCGC.length > 0) {
        res.json(activeGCGC);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getActiveCongMainForEmployeeSP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeCongMain = await DotCong.getActiveCongMainForEmployeeSP(
        maNV,
        moment(req.body.month).format("MM-YYYY")
      );
      if (activeCongMain.length > 0) {
        res.json(activeCongMain);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
  //get không body
  getActiveHeSoThuongForEmployeeSPP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeHeSoThuong = await DotCong.getActiveHeSoThuongForEmployeeSPP(
        maNV
      );
      if (activeHeSoThuong.length > 0) {
        res.json(activeHeSoThuong);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getActiveGCGCForEmployeeSPP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeGCGC = await DotCong.getActiveGCGCForEmployeeSPP(maNV);
      if (activeGCGC.length > 0) {
        res.json(activeGCGC);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getActiveCongMainForEmployeeSPP: async (req, res) => {
    try {
      const { maNV } = req.params;
      const activeCongMain = await DotCong.getActiveCongMainForEmployeeSPP(
        maNV
      );
      if (activeCongMain.length > 0) {
        res.json(activeCongMain);
      } else {
        res.status(404).json({ message: "Không tìm thấy bản ghi phù hợp" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
};
module.exports = dotCongController;
