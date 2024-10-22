const db = require("../config/db"); // Giả sử bạn đã cấu hình kết nối database

exports.searchCong = async (req, res) => {
  try {
    const { month, periodName, paymentDate, employeeId } = req.query;
    let query = `
      SELECT 
        nv.ma_nv, 
        nv.ten_nv AS ho_ten,
        dl.ten_dot AS dot_luong,
        dl.ngay_thanh_toan,
        cn.tong_cong AS tong_cong_ngoai,
        ct.tong_cong AS tong_cong_trong
      FROM 
        sync_data_hi_time_sheet.sync_nhan_vien nv
        LEFT JOIN pm_luong_chi_ngoai cn ON nv.ma_nv = cn.ma_nv
        LEFT JOIN pm_luong_chi_trong ct ON nv.ma_nv = ct.ma_nv
        LEFT JOIN pm_luong_dot dl ON (cn.id_dot = dl.id OR ct.id_dot = dl.id)
      WHERE 
        (cn.id IS NOT NULL OR ct.id IS NOT NULL)
    `;

    const queryParams = [];

    if (month && month !== "Invalid date") {
      query += ' AND DATE_FORMAT(dl.ngay_thanh_toan, "%m-%Y") = ?';
      queryParams.push(month);
    }

    if (periodName && periodName !== "") {
      query += " AND dl.id = ?";
      queryParams.push(periodName);
    }

    if (paymentDate && paymentDate !== "Invalid date") {
      query += " AND dl.ngay_thanh_toan = ?";
      queryParams.push(paymentDate);
    }

    if (employeeId && employeeId !== "") {
      query += " AND nv.ma_nv = ?";
      queryParams.push(employeeId);
    }

    query += " ORDER BY dl.ngay_thanh_toan DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    // Xử lý định dạng ngày và số
    const formattedResults = results.map((result) => ({
      ...result,
      ngay_thanh_toan: result.ngay_thanh_toan
        ? new Date(result.ngay_thanh_toan).toLocaleDateString("vi-VN")
        : "Invalid date",
      tong_cong_ngoai: result.tong_cong_ngoai
        ? `${result.tong_cong_ngoai.toLocaleString("vi-VN")} VND`
        : "0 VND",
      tong_cong_trong: result.tong_cong_trong
        ? `${result.tong_cong_trong.toLocaleString("vi-VN")} VND`
        : "0 VND",
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongsByQLOLD = async (req, res) => {
  try {
    const { phutrach } = req.params;
    const { page = 1, limit = 50 } = req.query; // Mặc định page 1, limit 50

    if (!phutrach) {
      return res
        .status(400)
        .json({ message: "Mã phụ trách không được cung cấp" });
    }

    const offset = (page - 1) * limit;

    // Query để lấy tổng số bản ghi
    const countQuery = `
      SELECT COUNT(DISTINCT nv.id) as total
      FROM sync_data_hi_time_sheet.sync_nhan_vien nv
      LEFT JOIN pm_bo_phan_quan_ly_new bp_new ON bp_new.id_bo_phan = nv.id_bo_phan
      LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_new.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id			
      WHERE pb.id IN (
        SELECT pb.id
        FROM pm_phong_ban_quan_ly_new pb
        WHERE pb.phu_trach = ?
      )
    `;

    // Query chính với LIMIT và OFFSET
    const dataQuery = `
      SELECT DISTINCT nv.*, bp.ten_bo_phan
      FROM sync_data_hi_time_sheet.sync_nhan_vien nv
      LEFT JOIN pm_bo_phan_quan_ly_new bp_new ON bp_new.id_bo_phan = nv.id_bo_phan
      LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_new.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id_phong_ban				
      WHERE pb.id IN (
        SELECT pb.id
        FROM pm_phong_ban_quan_ly_new pb
        WHERE pb.phu_trach = ?
      )
      LIMIT ? OFFSET ?
    `;

    const [[{ total }]] = await db.query(countQuery, [phutrach]);
    const [results] = await db.query(dataQuery, [
      phutrach,
      parseInt(limit),
      offset,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên nào" });
    }

    res.json({
      results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongsByQL = async (req, res) => {
  try {
    const { phutrach } = req.params;
    const { page = 1, limit = 10, employeeId, bophan } = req.query;

    if (!phutrach) {
      return res
        .status(400)
        .json({ message: "Mã phụ trách không được cung cấp" });
    }

    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM sync_data_hi_time_sheet.sync_nhan_vien nv
      LEFT JOIN pm_bo_phan_quan_ly_new bpqln ON nv.id_bo_phan = bpqln.id_bo_phan
      LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bpqln.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id_phong_ban = bp.id_phong_ban
      LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pb2 ON pb2.id = pb.id_phong_ban
      WHERE bpqln.phu_trach = ?
         OR pb.id IN (
            SELECT pb.id
            FROM pm_phong_ban_quan_ly_new pb
            WHERE pb.phu_trach = ?
         )
    `;

    const queryParams = [phutrach, phutrach];

    if (employeeId) {
      baseQuery += " AND nv.ma_nv LIKE ?";
      queryParams.push(`%${employeeId}%`);
    }

    if (bophan) {
      baseQuery += " AND bp.id = ?";
      queryParams.push(bophan);
    }

    // Query để lấy tổng số bản ghi
    const countQuery = `SELECT COUNT(DISTINCT nv.id) as total ${baseQuery}`;

    // Query chính với LIMIT và OFFSET
    const dataQuery = `SELECT DISTINCT nv.*, bp.ten_bo_phan ${baseQuery} LIMIT ? OFFSET ?`;

    const [[{ total }]] = await db.query(countQuery, queryParams);
    const [results] = await db.query(dataQuery, [
      ...queryParams,
      parseInt(limit),
      offset,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên nào" });
    }

    res.json({
      results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongsByTT = async (req, res) => {
  try {
    const { phutrach } = req.params;
    const { page = 1, limit = 50 } = req.query; // Mặc định page 1, limit 50

    if (!phutrach) {
      return res
        .status(400)
        .json({ message: "Mã phụ trách không được cung cấp" });
    }

    const offset = (page - 1) * limit;

    // Query để lấy tổng số bản ghi
    const countQuery = `
      SELECT  COUNT(*) as total
      FROM sync_data_hi_time_sheet.sync_nhan_vien nv
      JOIN pm_bo_phan_quan_ly_new bp_ql ON nv.id_bo_phan = bp_ql.id_bo_phan
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_ql.id_bo_phan = bp.id
      WHERE bp_ql.phu_trach = ?
    `;

    // Query chính với LIMIT và OFFSET
    const dataQuery = `
      SELECT DISTINCT bp.ten_bo_phan ,nv.* 
      FROM sync_data_hi_time_sheet.sync_nhan_vien nv
      JOIN pm_bo_phan_quan_ly_new bp_ql ON nv.id_bo_phan = bp_ql.id_bo_phan
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_ql.id_bo_phan = bp.id
      WHERE bp_ql.phu_trach = ?
      LIMIT ? OFFSET ?
    `;

    const [[{ total }]] = await db.query(countQuery, [phutrach]);
    const [results] = await db.query(dataQuery, [
      phutrach,
      parseInt(limit),
      offset,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên nào" });
    }

    res.json({
      results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongsTTByIDNV = async (req, res) => {
  try {
    const { bang_luong_t, id_bo_phan } = req.params;

    if (!bang_luong_t || !id_bo_phan) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const queryBase = `
      SELECT DISTINCT d.id AS d_id,d.bang_luong_t AS d_bang_luong_t, d.loai_phieu AS d_loai_phieu, l.*
      FROM pm_luong_dot d
      LEFT JOIN ?? l ON d.id = l.id_dot
      WHERE d.bang_luong_t = ? AND d.loai_phieu = ? AND l.ma_nv IN (
        SELECT nv.ma_nv
        FROM sync_data_hi_time_sheet.sync_nhan_vien nv
        WHERE nv.id_bo_phan =?
      )
    `;

    const [resultscn] = await db.query(queryBase, [
      "pm_luong_chi_ngoai",
      bang_luong_t,
      "2",
      id_bo_phan,
    ]);

    const [resultsct] = await db.query(queryBase, [
      "pm_luong_chi_trong",
      bang_luong_t,
      "1",
      id_bo_phan,
    ]);

    res.json({ resultscn, resultsct });
    // console.log(resultscn.length, resultsct.length);
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongsQLByIDNV = async (req, res) => {
  try {
    const { bang_luong_t, phutrach } = req.params;

    if (!bang_luong_t || !phutrach) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const queryBase = `
      SELECT DISTINCT d.id AS d_id,d.bang_luong_t AS d_bang_luong_t, d.loai_phieu AS d_loai_phieu, l.*
      FROM pm_luong_dot d
      LEFT JOIN ?? l 
			ON d.id = l.id_dot
      WHERE d.bang_luong_t = ? AND d.loai_phieu = ? AND l.ma_nv IN (
        SELECT nv.ma_nv
        FROM sync_data_hi_time_sheet.sync_nhan_vien nv
				LEFT JOIN pm_bo_phan_quan_ly_new bp_new
				on bp_new.id_bo_phan = nv.id_bo_phan
				LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_new.id_bo_phan = bp.id
				LEFT JOIN pm_phong_ban_quan_ly_new pb
				on pb.id = bp.id		
        WHERE pb.id IN (
						SELECT pb.id
						FROM pm_phong_ban_quan_ly_new pb
						WHERE pb.phu_trach = ?
				)
      )
    `;

    const [resultscn] = await db.query(queryBase, [
      "pm_luong_chi_ngoai",
      bang_luong_t,
      "2",
      phutrach,
    ]);

    const [resultsct] = await db.query(queryBase, [
      "pm_luong_chi_trong",
      bang_luong_t,
      "1",
      phutrach,
    ]);

    res.json({ resultscn, resultsct });
  } catch (error) {
    console.error("Error searching Cong:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getComplaintDetailsHST = async (req, res) => {
  try {
    const { dotId, maNV, status, phongban } = req.query;

    console.log("dotId", dotId);
    console.log("maNV", maNV);
    console.log("status", status);
    console.log("phongban", phongban);
    if (!dotId && !maNV && !status && !phongban) {
      return res
        .status(400)
        .json({ message: "Cần ít nhất một điều kiện tìm kiếm" });
    }

    let query = `
      SELECT DISTINCT
        nv.id as idNV,
        d.id as id_dot,
        d.time_start,
        d.time_end,
        nv.ma_nv,
        nv.ten_nv as TenNV,
        bp.ten_bo_phan,
        pbnew.ten_phong_ban,
        sl.id as id_status, 
        sl.tinh_trang,
        sl.tinh_trang_ns_khieu_nai,
        sl.noi_dung_kn,
        sl.ly_do,
        ct.*
      FROM pm_cong_dot d
      INNER JOIN pm_cong_status_cong sl ON d.id = sl.id_dot
      INNER JOIN pm_he_so_thuong ct ON ct.id = sl.id_he_so_thuong
      INNER JOIN sync_data_hi_time_sheet.sync_nhan_vien nv ON ct.so_the = nv.ma_nv
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON nv.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id_phong_ban
      LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
      WHERE 1=1
    `;

    const queryParams = [];

    if (dotId) {
      query += " AND d.id = ?";
      queryParams.push(dotId);
    }

    if (maNV) {
      query += " AND nv.ma_nv = ?";
      queryParams.push(maNV);
    }

    if (status) {
      query += " AND (sl.tinh_trang = ? OR sl.tinh_trang_ns_khieu_nai = ?)";
      queryParams.push(status, status);
    }

    if (phongban) {
      query += " AND pb.id = ? AND bp.id_phong_ban = pb.id";
      queryParams.push(phongban);
    }

    query += " ORDER BY d.id DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin khiếu nại" });
    }

    // Xử lý định dạng dữ liệu nếu cần
    const formattedResults = results.map((result) => ({
      ...result,
      // Thêm bất kỳ xử lý dữ liệu nào nếu cần
    }));

    res.json(formattedResults);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getComplaintDetailsGCGC = async (req, res) => {
  try {
    const { dotId, maNV, status, phongban } = req.query;

    if (!dotId && !maNV && !status && !phongban) {
      return res
        .status(400)
        .json({ message: "Cần ít nhất một điều kiện tìm kiếm" });
    }

    let query = `
      SELECT DISTINCT
        nv.id as idNV,
        d.id as id_dot,
        d.time_start,
        d.time_end,
        nv.ma_nv,
        nv.ten_nv as TenNV,
        bp.ten_bo_phan,
        pbnew.ten_phong_ban,
        sl.id as id_status, 
        sl.tinh_trang,
        sl.tinh_trang_ns_khieu_nai,
        sl.noi_dung_kn,
        sl.ly_do,
        ct.*
      FROM pm_cong_dot d
      INNER JOIN pm_cong_status_cong sl ON d.id = sl.id_dot
      INNER JOIN pm_gio_cong_gian_ca ct ON ct.id = sl.id_gio_cong_gian_ca
      INNER JOIN sync_data_hi_time_sheet.sync_nhan_vien nv ON ct.so_the = nv.ma_nv
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON nv.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id_phong_ban
      LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
      WHERE 1=1
    `;

    const queryParams = [];

    if (dotId) {
      query += " AND d.id = ?";
      queryParams.push(dotId);
    }

    if (maNV) {
      query += " AND nv.ma_nv = ?";
      queryParams.push(maNV);
    }

    if (status) {
      query += " AND (sl.tinh_trang = ? OR sl.tinh_trang_ns_khieu_nai = ?)";
      queryParams.push(status, status);
    }

    if (phongban) {
      query += " AND pb.id = ? AND bp.id_phong_ban = pb.id";
      queryParams.push(phongban);
    }

    query += " ORDER BY d.id DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin khiếu nại" });
    }

    // Xử lý định dạng dữ liệu nếu cần
    const formattedResults = results.map((result) => ({
      ...result,
    }));
    res.json(formattedResults);
  } catch (error) {
    console.error("Error getting complaint details:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getComplaintDetailsMain = async (req, res) => {
  try {
    const { dotId, maNV, status, phongban } = req.query;

    if (!dotId && !maNV && !status && !phongban) {
      return res
        .status(400)
        .json({ message: "Cần ít nhất một điều kiện tìm kiếm" });
    }

    let query = `
      SELECT DISTINCT
        nv.id as idNV,
        d.id as id_dot,
        d.time_start,
        d.time_end,
        nv.ma_nv,
        nv.ten_nv as TenNV,
        bp.ten_bo_phan,
        pbnew.ten_phong_ban,
        sl.id as id_status, 
        sl.tinh_trang,
        sl.tinh_trang_ns_khieu_nai,
        sl.noi_dung_kn,
        sl.ly_do,
        ct.*
      FROM pm_cong_dot d
      INNER JOIN pm_cong_status_cong sl ON d.id = sl.id_dot
      INNER JOIN pm_cong_main ct ON ct.id = sl.id_cong_main
      INNER JOIN sync_data_hi_time_sheet.sync_nhan_vien nv ON ct.so_the = nv.ma_nv
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON nv.id_bo_phan = bp.id
      LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id_phong_ban
      LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
      WHERE 1=1
    `;

    const queryParams = [];

    if (dotId) {
      query += " AND d.id = ?";
      queryParams.push(dotId);
    }

    if (maNV) {
      query += " AND nv.ma_nv = ?";
      queryParams.push(maNV);
    }

    if (status) {
      query += " AND (sl.tinh_trang = ? OR sl.tinh_trang_ns_khieu_nai = ?)";
      queryParams.push(status, status);
    }

    if (phongban) {
      query += " AND pb.id = ? AND bp.id_phong_ban = pb.id";
      queryParams.push(phongban);
    }

    query += " ORDER BY d.id DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin khiếu nại" });
    }

    // Xử lý định dạng dữ liệu nếu cần
    const formattedResults = results.map((result) => ({
      ...result,
    }));
    res.json(formattedResults);
  } catch (error) {
    console.error("Error getting complaint details:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getComplaintDetailsCTByTT = async (req, res) => {
  try {
    const { dotId, maNV, status } = req.query;

    if (!dotId && !maNV && !status) {
      return res
        .status(400)
        .json({ message: "Cần ít nhất một điều kiện tìm kiếm" });
    }

    let query = `
      SELECT 
        nv.id as idNV,
        d.id as id_dot,
        d.time_start,
        d.time_end,
        nv.ma_nv,
        nv.ten_nv as TenNV,
        bp.ten_bo_phan,
        sl.id as id_status, 
        sl.tinh_trang,
        sl.tinh_trang_ns_khieu_nai,
        sl.noi_dung_kn,
        ct.*
      FROM pm_luong_dot d
      LEFT JOIN pm_luong_status_luong sl ON d.id = sl.id_dot
      LEFT JOIN pm_luong_chi_trong ct ON ct.id = sl.id_trong
      LEFT JOIN sync_data_hi_time_sheet.sync_nhan_vien nv ON ct.ma_nv = nv.ma_nv
      LEFT JOIN pm_bo_phan_quan_ly_new bp_ql ON nv.id_bo_phan = bp_ql.id_bo_phan
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_ql.id_bo_phan = bp.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (dotId) {
      query += " AND d.id = ?";
      queryParams.push(dotId);
    }

    if (maNV) {
      query += " AND nv.ma_nv = ?";
      queryParams.push(maNV);
    }

    if (status) {
      query += " AND sl.tinh_trang = ?";
      queryParams.push(status);
    }

    // query += " ORDER BY d.id DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin khiếu nại" });
    }

    // Xử lý định dạng dữ liệu nếu cần
    const formattedResults = results.map((result) => ({
      ...result,
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Error getting complaint details:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getComplaintDetailsCNByTT = async (req, res) => {
  try {
    const { dotId, maNV, status } = req.query;

    if (!dotId && !maNV && !status) {
      return res
        .status(400)
        .json({ message: "Cần ít nhất một điều kiện tìm kiếm" });
    }

    let query = `
      SELECT 
        nv.id as idNV,
        d.id as id_dot,
        d.time_start,
        d.time_end,
        nv.ma_nv,
        nv.ten_nv as TenNV,
        bp.ten_bo_phan,
        sl.id as id_status, 
        sl.tinh_trang,
        sl.tinh_trang_ns_khieu_nai,
        sl.noi_dung_kn,
        cn.*
      FROM pm_luong_dot d
      LEFT JOIN pm_luong_status_luong sl ON d.id = sl.id_dot
      LEFT JOIN pm_luong_chi_ngoai cn ON cn.id = sl.id_ngoai
      LEFT JOIN sync_data_hi_time_sheet.sync_nhan_vien nv ON cn.ma_nv = nv.ma_nv
      LEFT JOIN pm_bo_phan_quan_ly_new bp_ql ON nv.id_bo_phan = bp_ql.id_bo_phan
			LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bp_ql.id_bo_phan = bp.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (dotId) {
      query += " AND d.id = ?";
      queryParams.push(dotId);
    }

    if (maNV) {
      query += " AND nv.ma_nv = ?";
      queryParams.push(maNV);
    }

    if (status) {
      query += " AND sl.tinh_trang = ? OR sl.tinh_trang_ns_khieu_nai = ?";
      queryParams.push(status, status);
    }

    // query += " ORDER BY d.id DESC, nv.ma_nv";

    const [results] = await db.query(query, queryParams);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin khiếu nại" });
    }

    // Xử lý định dạng dữ liệu nếu cần
    const formattedResults = results.map((result) => ({
      ...result,
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Error getting complaint details:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getCongDetails = async (req, res) => {
  try {
    const {
      phuTrach,
      maNV,
      idDot,
      idTrong,
      tinhTrang,
      page = 1,
      limit = 10,
      loaiPhieu,
      bophan,
    } = req.query;
    const offset = (page - 1) * limit;

    let luongTable, idColumn;
    if (loaiPhieu === "1") {
      luongTable = "pm_luong_chi_trong";
      idColumn = "id_trong";
    } else if (loaiPhieu === "2") {
      luongTable = "pm_luong_chi_ngoai";
      idColumn = "id_ngoai";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Loại phiếu không hợp lệ" });
    }

    let conditions = [];
    let params = [];

    if (phuTrach) {
      conditions.push(
        "(bpqln.phu_trach = ? OR pb.id IN (SELECT pb.id FROM pm_phong_ban_quan_ly_new pb WHERE pb.phu_trach = ?))"
      );
      params.push(phuTrach, phuTrach);
    }

    if (maNV) {
      conditions.push("nv.ma_nv = ?");
      params.push(maNV);
    }

    if (idDot) {
      conditions.push("l.id_dot = ?");
      params.push(idDot);
    }

    if (idTrong) {
      conditions.push("l.id = ?");
      params.push(idTrong);
    }

    if (tinhTrang === "Chưa xác nhận") {
      conditions.push(
        "(sl.tinh_trang NOT IN ('Đã xác nhận', 'Câu hỏi') OR sl.id IS NULL)"
      );
    } else if (tinhTrang) {
      conditions.push("sl.tinh_trang = ?");
      params.push(tinhTrang);
    }

    if (bophan) {
      conditions.push("bp.id = ?");
      params.push(bophan);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const baseQuery = `
    FROM 
    sync_data_hi_time_sheet.sync_nhan_vien nv
    LEFT JOIN pm_bo_phan_quan_ly_new bpqln ON nv.id_bo_phan = bpqln.id_bo_phan
    LEFT JOIN sync_data_hi_time_sheet.sync_bo_phan bp ON bpqln.id_bo_phan = bp.id
    LEFT JOIN pm_phong_ban_quan_ly_new pb ON pb.id = bp.id_phong_ban
    LEFT JOIN sync_data_hi_time_sheet.sync_phong_ban pbnew ON pbnew.id = pb.id_phong_ban
    LEFT JOIN ${luongTable} l ON l.ma_nv = nv.ma_nv
    LEFT JOIN pm_luong_dot d ON d.id = l.id_dot
    LEFT JOIN pm_luong_status_luong sl ON sl.${idColumn} = l.id AND sl.id_dot = l.id_dot
    ${whereClause}
    `;

    const queryMain = `
    SELECT DISTINCT 
      nv.id as nv_id,
      nv.ten_nv,
      nv.ma_nv,
      bp.ten_bo_phan,
      pbnew.ten_phong_ban,
      l.id as l_id,
      l.id_dot,
      d.bang_luong_t,
      sl.tinh_trang,
      sl.ly_do,
      CASE 
        WHEN l.id IS NULL THEN 'Chưa có phiếu lương'
        WHEN sl.id IS NULL THEN 'Chưa có trạng thái'
        ELSE 'Có phiếu lương'
      END as status_phieu_luong
    ${baseQuery}
    ORDER BY bp.ten_bo_phan ASC, nv.ma_nv ASC
    LIMIT ?
    OFFSET ?
    `;

    const queryCount = `
    SELECT COUNT(DISTINCT nv.id) as total
    ${baseQuery}
    `;

    params.push(parseInt(limit), parseInt(offset));

    const [results] = await db.query(queryMain, params);
    const [[{ total }]] = await db.query(queryCount, params.slice(0, -2));

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in getCongDetails:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getCongStatusOLD = async (req, res) => {
  try {
    const { dotId, id, type, status } = req.params; // Thêm type để phân biệt giữa trong và ngoài
    let query;
    if (type === "trong") {
      query = `
        SELECT sl.*, ct.id AS idtrong 
        FROM pm_luong_status_luong sl
        LEFT JOIN pm_luong_chi_trong ct 
          ON sl.id_trong = ct.id 
          AND sl.id_dot = ct.id_dot
        WHERE sl.id_dot = ? 
          AND sl.id_trong = ?
          AND sl.tinh_trang =?
      `;
    } else if (type === "ngoai") {
      query = `
        SELECT sl.*, cn.id AS idngoai 
        FROM pm_luong_status_luong sl
        LEFT JOIN pm_luong_chi_ngoai cn 
          ON sl.id_ngoai = cn.id 
          AND sl.id_dot = cn.id_dot
        WHERE sl.id_dot = ? 
          AND sl.id_ngoai = ?
          AND sl.tinh_trang =? 
      `;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const [results] = await db.query(query, [dotId, id, status]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
    }

    res.json(results);
  } catch (error) {
    console.error("Error in getCongStatus:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
