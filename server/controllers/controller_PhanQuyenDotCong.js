const db = require("../config/db");
const moment = require("moment");

exports.getPhanQuyenWorkHours = async (req, res) => {
  try {
    const [phanQuyenDotCong] = await db.query(`
        SELECT DISTINCT pb.*, spb.ten_phong_ban
        FROM pm_phong_ban_quan_ly_new pb
        LEFT JOIN pm_cong_phong_ban_disable pbd ON pb.id = pbd.id_phong_ban
        LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban spb ON pb.id_phong_ban = spb.id
      `);
    res.status(200).json(phanQuyenDotCong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPhanQuyenWorkHoursByIdDot = async (req, res) => {
  const { id_dot } = req.params;
  try {
    const [phanQuyenDotCong] = await db.query(
      `SELECT * FROM pm_cong_dot_phong_ban_time_allow_view WHERE id_dot = ?`,
      [id_dot]
    );
    res.status(200).json(phanQuyenDotCong);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePhanQuyenWorkHours = async (req, res) => {
  const { id_dot, phanQuyenDotCong } = req.body;

  // Kiểm tra xem phanQuyenDotCong có tồn tại và là một mảng không
  if (!phanQuyenDotCong || !Array.isArray(phanQuyenDotCong)) {
    return res.status(400).json({ error: "Dữ liệu phân quyền không hợp lệ" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Bước 1: Lấy dữ liệu hiện có từ cơ sở dữ liệu
    const [existingData] = await connection.query(
      "SELECT * FROM pm_cong_dot_phong_ban_time_allow_view WHERE id_dot = ?",
      [id_dot]
    );

    // Bước 2: Tạo một Map để dễ dàng tìm kiếm dữ liệu hiện có
    const existingDataMap = new Map(
      existingData.map((item) => [`${item.id_phong_ban}_${item.id_dot}`, item])
    );

    // Bước 3: Kết hợp dữ liệu hiện có với dữ liệu mới
    const updatedData = phanQuyenDotCong.map((newItem) => {
      const key = `${newItem.id_phong_ban}_${id_dot}`;
      const existingItem = existingDataMap.get(key);
      if (existingItem) {
        return {
          ...existingItem,
          ...newItem,
          id_dot: id_dot,
        };
      } else {
        return {
          ...newItem,
          id_dot: id_dot,
        };
      }
    });

    // Bước 4: Cập nhật hoặc chèn dữ liệu
    const updatePromises = updatedData.map((item) => {
      const sql = `
          INSERT INTO pm_cong_dot_phong_ban_time_allow_view
          ( id_dot, id_phong_ban, time_start, time_end)
          VALUES ( ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          time_start = VALUES(time_start),
          time_end = VALUES(time_end)
        `;
      const values = [
        item.id_dot,
        item.id_phong_ban,
        moment(item.time_start).format("YYYY-MM-DD HH:mm:ss"),
        moment(item.time_end).format("YYYY-MM-DD HH:mm:ss"),
      ];
      return connection.query(sql, values);
    });

    await Promise.all(updatePromises);

    await connection.commit();
    res.status(200).json({ message: "Cập nhật phân quyền 'công' thành công" });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi khi cập nhật dữ liệu:", error);
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi cập nhật phân quyền công" });
  } finally {
    connection.release();
  }
};
