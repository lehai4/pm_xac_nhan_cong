const db = require("../config/db"); // Giả sử bạn có file cấu hình database

exports.getStatusLuongByDotId = async (req, res) => {
  const dotId = req.params.dotId; // Giả sử dotId được truyền qua params

  try {
    const query = `
      SELECT DISTINCT sl.*, d.*
      FROM pm_luong_status_luong sl
      JOIN pm_luong_dot d ON d.id = sl.id_dot
      WHERE d.id = ? AND sl.id_dot = d.id
    `;

    const [results] = await db.query(query, [dotId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getChiTrongByDotId = async (req, res) => {
  const dotId = req.params.dotId; // Giả sử dotId được truyền qua params

  try {
    const query = `
      SELECT DISTINCT ct.*, d.*
      FROM pm_luong_chi_trong ct
      JOIN pm_luong_dot d ON d.id = ct.id_dot
      WHERE d.id = ? AND ct.id_dot = d.id
    `;

    const [results] = await db.query(query, [dotId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy dữ liệu chi trong" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu chi trong:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getChiNgoaiByDotId = async (req, res) => {
  const dotId = req.params.dotId;

  try {
    const query = `
      SELECT DISTINCT cn.*, d.*
      FROM pm_luong_chi_ngoai cn
      JOIN pm_luong_dot d ON d.id = cn.id_dot
      WHERE d.id = ? AND cn.id_dot = d.id
    `;

    const [results] = await db.query(query, [dotId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy dữ liệu chi ngoài" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu chi ngoài:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
