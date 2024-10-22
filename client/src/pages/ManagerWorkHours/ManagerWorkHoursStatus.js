import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import CongComplaintModal from "../../components/Model/CongComplaintModal";
import UpdateCongComplaintModal from "../../components/Model/UpdateCongComplaintModal";
import { API_BASE_URL } from "../../config/api";
import { useCallback } from "react";
import UpdateStatusModal from "../../components/Model/UpdateStatusModal";

const ManagerWorkHoursStatus = () => {
  const [dotCongs, setDotCongs] = useState([]);
  const [dotCong, setDotCong] = useState([]);
  const [loaiPhieu, setLoaiPhieu] = useState([]);
  const [phongban, setPhongban] = useState([]);
  const [dateInput, setDateInput] = useState(null);
  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth())),
    periodName: "",
    employeeId: "",
    status: "Câu hỏi",
    phongban: "",
  });

  useEffect(() => {
    fetchData();
  }, [search.month, search.periodName, search.status, search.phongban]);

  const fetchData = async () => {
    await DotCong();
    await LoaiPhieu();
    await PhongBan();
  };

  const PhongBan = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/phongban`);
      const sortedPhongban = response.data.sort((a, b) =>
        a.ten_phong_ban.localeCompare(b.ten_phong_ban, "vi", {
          sensitivity: "base",
        })
      );
      setPhongban(sortedPhongban);
    } catch (error) {
      console.error("Error fetching phong ban:", error);
    }
  };

  const LoaiPhieu = async () => {
    const response = await axios.get(
      `${API_BASE_URL}/dotcong/${search.periodName}`
    );
    setLoaiPhieu(response.data);
  };

  const handleSearchChange = (name, value) => {
    setSearch((prev) => ({
      ...prev,
      [name]: value === null ? "" : value,
    }));
  };
  // Hiện modal Câu hỏi
  const [showModal, setShowModal] = useState(false);
  const [selectedDotCong, setSelectedDotCong] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDotCongs, setSelectedDotCongs] = useState([]);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (id) => {
    setSelectedDotCongs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = () => {
    if (selectedDotCongs.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bản ghi để cập nhật");
      return;
    }
    setShowUpdateModal(true);
  };

  const handleViewCong = (cong) => {
    setSelectedDotCong(cong);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDotCong(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleShowUpdateStatus = (cong) => {
    setShowUpdateStatus(true);
    setSelectedDotCong(cong);
  };

  const handleCloseUpdateStatus = () => {
    setShowUpdateStatus(false);
    setSelectedDotCong(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      console.log(selectedDotCong.id_status);
      console.log(newStatus);
      // Gọi API để cập nhật trạng thái
      const array = [
        {
          id: selectedDotCong.id_status,
          tinh_trang: newStatus,
        },
      ];
      await axios.put(
        `${API_BASE_URL}/statusCong/update/update-multiple`,
        array
      );

      // Cập nhật state local
      setDotCongs(
        dotCongs.map((s) =>
          s.id_status === selectedDotCong.id_status
            ? { ...s, tinh_trang: newStatus }
            : s
        )
      );

      toast.success(`Đã ${newStatus.toLowerCase()} yêu cầu`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleCongUpdate = async (status) => {
    if (selectedDotCongs.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bản ghi để cập nhật");
      return;
    }

    let updatedDataArray = selectedDotCongs.map((id) => ({
      id: parseInt(id, 10),
      // If status is "Chưa xác nhận" or "Đang xem", update tinh_trang, otherwise update tinh_trang_ns_khieu_nai
      ...(status === "Chưa xác nhận" || status === "Đang xem"
        ? { tinh_trang: status }
        : { tinh_trang_ns_khieu_nai: status }),
    }));

    // console.log("Updating data:", updatedDataArray);

    try {
      const updateStatusResponse = await axios.put(
        `${API_BASE_URL}/statusCong/update/update-multiple`,
        updatedDataArray
      );

      if (updateStatusResponse.status === 200) {
        await fetchData();
        const { message, results } = updateStatusResponse.data;
        toast.success(message);
        results.forEach((result) => {
          if (result.success) {
            console.log(`Cập nhật thành công cho ID: ${result.id}`);
          } else {
            console.log(result);
            console.error(
              `Cập nhật thất bại cho ID: ${result.id}. Lỗi: ${result.error}`
            );
          }
        });
        setShowUpdateModal(false);
        setSelectedDotCongs([]);
      } else {
        throw new Error("Yêu cầu cập nhật không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // Lấy dữ liệu đợt công
  const DotCong = async () => {
    if (search.month) {
      try {
        const formattedMonth = moment(search.month).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotcong/month/${formattedMonth}`
        );
        setDotCong(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt công:", error);
        setDotCong([]);
      }
    } else {
      setDotCong([]);
    }
  };

  // Tìm kiếm thông tin Câu hỏi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        dotId: search.periodName,
        maNV: search.employeeId,
        status: search.status, // Thêm status vào query params
        phongban: search.phongban,
      });

      // Loại bỏ các tham số trống
      if (!search.periodName) queryParams.delete("dotId");
      if (!search.employeeId) queryParams.delete("maNV");
      if (!search.status) queryParams.delete("status");
      if (!search.phongban) queryParams.delete("phongban");

      const endpoint =
        loaiPhieu.loai_phieu === "1"
          ? "/complaint-details-hst"
          : loaiPhieu.loai_phieu === "3"
          ? "/complaint-details-main"
          : loaiPhieu.loai_phieu === "2"
          ? "/complaint-details-gcgc"
          : "";
      // console.log("Endpoint: " + endpoint);
      const response = await axios.get(
        `${API_BASE_URL}/congs${endpoint}?${queryParams}`
      );

      // console.log(response.data);

      if (response.data && response.data.length > 0) {
        // Sắp xếp dữ liệu
        const sortedData = response.data.sort((a, b) => {
          // Kiểm tra xem ten_bo_phan và ma_nv có tồn tại và không phải null/undefined
          const aBoPhan = a.ten_bo_phan || "";
          const bBoPhan = b.ten_bo_phan || "";
          const aMaNV = a.ma_nv || "";
          const bMaNV = b.ma_nv || "";

          if (search.phongban) {
            // Nếu đã chọn bộ phận, chỉ sắp xếp theo mã nhân viên
            return aMaNV.localeCompare(bMaNV, "vi");
          } else {
            // Nếu không chọn bộ phận, sắp xếp theo bộ phận rồi đến mã nhân viên
            const boPhanComparison = aBoPhan.localeCompare(bBoPhan, "vi");
            if (boPhanComparison !== 0) {
              return boPhanComparison;
            }
            return aMaNV.localeCompare(bMaNV, "vi");
          }
        });
        setDotCongs(sortedData);
      } else {
        setDotCongs([]);
      }

      // console.log(response.data);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thông tin Câu hỏi:", error);
      setDotCongs([]);
      if (error.response && error.response.status === 404) {
        toast.error("Không tìm thấy thông tin Câu hỏi");
      } else {
        toast.error("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Xuất file Excel
  const handleExportExcel = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của nút
    if (dotCongs.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Trạng thái");
      if (
        search.status === "Đã gửi lý do chưa xác nhận" ||
        search.status === "Câu hỏi"
      ) {
        // Thiết lập tiêu đề
        worksheet.mergeCells("A1:E1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `Trạng thái ${loaiPhieu.ten_dot}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFAA00" },
        };
      } else {
        // Thiết lập tiêu đề
        worksheet.mergeCells("A1:D1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `Trạng thái ${loaiPhieu.ten_dot}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFAA00" },
        };
      }

      if (search.status === "Đã gửi lý do chưa xác nhận") {
        // Thiết lập header
        const headers = ["Mã NV", "Họ tên", "Bộ phận", "Trạng thái", "Lý do"];
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
        };
      } else if (search.status === "") {
        const headers = [
          "Mã NV",
          "Họ tên",
          "Bộ phận",
          "Trạng thái",
          "Nội dung",
          "Lý do",
        ];
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
        };
      } else if (search.status === "Câu hỏi") {
        const headers = [
          "Mã NV",
          "Họ tên",
          "Bộ phận",
          "Trạng thái",
          "Nội dung",
        ];
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
        };
      } else {
        // Thiết lập header
        const headers = ["Mã NV", "Họ tên", "Bộ phận", "Trạng thái"];
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
        };
      }

      if (search.status === "Đã gửi lý do chưa xác nhận") {
        // Thêm dữ liệu
        dotCongs.forEach((salary) => {
          worksheet.addRow([
            salary.ma_nv,
            salary.ho_ten,
            salary.ten_bo_phan,
            salary.tinh_trang,
            salary.ly_do || " ",
          ]);
          // Chỉ thêm hàng nếu có ít nhất một giá trị không rỗng
          const row = worksheet.getRow(worksheet.rowCount);
          row.font = { size: 14 };
          row.alignment = { horizontal: "left", vertical: "middle" };
        });
      } else if (search.status === "") {
        // Thêm dữ liệu
        dotCongs.forEach((salary) => {
          worksheet.addRow([
            salary.ma_nv,
            salary.ho_ten,
            salary.ten_bo_phan,
            salary.tinh_trang,
            salary.noi_dung_kn || " ",
            salary.ly_do || " ",
          ]);
          // Chỉ thêm hàng nếu có ít nhất một giá trị không rỗng
          const row = worksheet.getRow(worksheet.rowCount);
          row.font = { size: 14 };
          row.alignment = { horizontal: "left", vertical: "middle" };
        });
      } else if (search.status === "Câu hỏi") {
        // Thêm dữ liệu
        dotCongs.forEach((salary) => {
          worksheet.addRow([
            salary.ma_nv,
            salary.ho_ten,
            salary.ten_bo_phan,
            salary.tinh_trang,
            salary.noi_dung_kn,
          ]);
          const row = worksheet.getRow(worksheet.rowCount);
          row.font = { size: 14 };
          row.alignment = { horizontal: "left", vertical: "middle" };
        });
      } else {
        // Thêm dữ liệu
        dotCongs.forEach((salary) => {
          worksheet.addRow([
            salary.ma_nv,
            salary.ho_ten,
            salary.ten_bo_phan,
            salary.tinh_trang,
          ]);
          const row = worksheet.getRow(worksheet.rowCount);
          row.font = { size: 14 };
          row.alignment = { horizontal: "left", vertical: "middle" };
        });
      }

      // Thiết lập chiều rộng cột
      worksheet.columns = [
        { width: 20 },
        { width: 30 },
        { width: 25 },
        { width: 20 },
        { width: 20 },
      ];

      // Áp dụng border cho tất cả các ô, bao gồm cả tiêu đề
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          if (cell.value) {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
          // Căn giữa cho tiêu đề và header, căn trái cho nội dung
          if (rowNumber <= 2) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
        });
      });

      // Tạo buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Tạo blob và lưu file
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `quan_ly_trang_thai_${new Date().toISOString()}.xlsx`);

      toast.success("Xuất Excel thành công");
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      toast.error("Đã xảy ra lỗi khi xuất file Excel. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    const filtered = dotCong.find(
      (dot) => dot.id === parseInt(search.periodName)
    );
    setDateInput(filtered && filtered.bang_cong_t);
  }, [search.periodName]);
  return (
    <div className="tab-pane fade show active" role="tabpanel">
      <div className="container-fluid py-3">
        <h4 className="text-center mb-4 text-primary h2 fw-bold">
          QUẢN LÝ TRẠNG THÁI
        </h4>
        <form className="needs-validation">
          <div className="row">
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative w-100">
                <label htmlFor="new-month-salary" className="form-label">
                  Bảng công tháng
                </label>
                <DatePicker
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  selected={search.month}
                  onChange={(date) => handleSearchChange("month", date)}
                  className="form-control w-auto"
                  id="new-month-salary"
                  autoComplete="off"
                  showYearDropdown
                  showMonthDropdown
                />
              </div>
            </div>
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="update-period-name" className="form-label">
                  Tên đợt công
                </label>
                <select
                  className="form-select"
                  id="update-period-name"
                  value={search.periodName}
                  onChange={(e) =>
                    handleSearchChange("periodName", e.target.value)
                  }
                  required
                >
                  <option value="">Chọn đợt công</option>
                  {dotCong && dotCong.length > 0 ? (
                    dotCong.map((dot) => (
                      <option key={dot.id} value={dot.id}>
                        {dot.ten_dot}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Không có đợt công
                    </option>
                  )}
                </select>
              </div>
            </div>
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="new-payment-date" className="form-label">
                  Trạng thái
                </label>
                <select
                  className="form-select"
                  id="update-status"
                  value={search.status}
                  onChange={(e) => handleSearchChange("status", e.target.value)}
                  disabled={search.periodName === ""}
                >
                  <option value="">Tất cả</option>
                  <option value="Đã xác nhận">Đã xác nhận</option>
                  <option value="Cập nhật lý do">Cập nhật lý do</option>
                  <option value="Đã cập nhật lý do chưa xác nhận">
                    Đã cập nhật lý do chưa xác nhận
                  </option>
                  <option value="Đang xem">Đang xem</option>
                  <option value="Chưa xác nhận">Chưa xác nhận</option>
                  <option value="Tắt trang">Tắt trang</option>
                  <option value="Hết giờ">Hết giờ</option>
                  <option value="Câu hỏi">Câu hỏi</option>
                  <option value="Cập nhật lại dữ liệu">
                    + Cập nhật lại dữ liệu
                  </option>
                  <option value="Dữ liệu đúng không cập nhật">
                    + Dữ liệu đúng không cập nhật
                  </option>
                </select>
              </div>
            </div>
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="phongban" className="form-label">
                  Bộ phận
                </label>
                <select
                  className="form-select"
                  id="phongban"
                  value={search.phongban}
                  onChange={(e) =>
                    handleSearchChange("phongban", e.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  {phongban && phongban.length > 0 ? (
                    phongban.map((bo) => (
                      <option key={`department-${bo.id}`} value={bo.id}>
                        {bo.ten_phong_ban}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Không có bộ phận
                    </option>
                  )}
                </select>
              </div>
            </div>
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="ma" className="form-label">
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ma"
                  placeholder="Nhập mã nhân viên"
                  value={search.employeeId}
                  onChange={(e) =>
                    handleSearchChange("employeeId", e.target.value)
                  }
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div className="row my-3 justify-content-center">
            <div className="col-xl-3 col-md-4">
              <button
                className="btn btn-lg btn-primary w-100"
                onClick={handleSubmit}
                disabled={isLoading} // Disable nút khi đang loading
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang tìm...
                  </>
                ) : (
                  "Tìm kiếm"
                )}
              </button>
            </div>
            <div className="col-xl-3 col-md-4">
              <button
                onClick={handleExportExcel}
                className="btn btn-lg btn-success w-100"
              >
                Xuất file Excel
              </button>
            </div>
          </div>
        </form>

        {isLoading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : dotCongs.length > 0 ? (
          <div className="mt-4">
            <h5>Kết quả tìm kiếm {dotCongs.length} bản ghi</h5>
            {(search.status === "Câu hỏi" || search.status === "Hết giờ") && (
              <button
                className="btn btn-primary mb-2"
                onClick={handleBulkUpdate}
                disabled={selectedDotCongs.length === 0}
              >
                Cập nhật trạng thái
              </button>
            )}
            <table className="table table-striped">
              <thead>
                <tr className="align-middle">
                  <th>
                    <input
                      type="checkbox"
                      onChange={() =>
                        setSelectedDotCongs(
                          selectedDotCongs.length === dotCongs.length
                            ? []
                            : dotCongs.map((s) => s.id_status)
                        )
                      }
                      checked={selectedDotCongs.length === dotCongs.length}
                    />
                  </th>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Bộ phận</th>
                  <th>Trạng thái</th>
                  {dotCongs[0].tinh_trang ===
                    "Đã cập nhật lý do chưa xác nhận" && <th>Lý do</th>}
                  {dotCongs[0].tinh_trang === "Cập nhật lý do" && (
                    <>
                      <th>Lý do</th>
                      <th>Hoạt động</th>
                    </>
                  )}
                  {dotCongs[0].tinh_trang === "Câu hỏi" && (
                    <>
                      <th className="">Nội dung</th>
                      <th className="text-center">Hoạt động</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {dotCongs.map((cong, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDotCongs.includes(cong.id_status)}
                        onChange={() => handleCheckboxChange(cong.id_status)}
                      />
                    </td>
                    <td>{cong.ma_nv}</td>
                    <td>
                      {cong.ho} {cong.ten}
                    </td>
                    <td>{cong.ten_bo_phan}</td>
                    <td>
                      {cong.tinh_trang}
                      {cong.tinh_trang_ns_khieu_nai && (
                        <span> - {cong.tinh_trang_ns_khieu_nai}</span>
                      )}
                    </td>
                    {dotCongs[0].tinh_trang ===
                      "Đã cập nhật lý do chưa xác nhận" && (
                      <td>{cong.ly_do}</td>
                    )}

                    {dotCongs[0].tinh_trang === "Cập nhật lý do" && (
                      <>
                        <td>{cong.ly_do}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleShowUpdateStatus(cong)}
                          >
                            Duyệt
                          </button>
                        </td>
                      </>
                    )}

                    {dotCongs[0].tinh_trang === "Câu hỏi" && (
                      <>
                        <td>{cong.noi_dung_kn}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewCong(cong)}
                          >
                            Xem
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <h5>Không tìm thấy thông tin Câu hỏi</h5>
          </div>
        )}
      </div>
      <CongComplaintModal
        loaiPhieu={loaiPhieu.loai_phieu}
        show={showModal}
        dateInput={dateInput}
        handleClose={handleCloseModal}
        congData={selectedDotCong}
      />
      <UpdateCongComplaintModal
        show={showUpdateModal}
        handleClose={handleCloseUpdateModal}
        onUpdate={handleCongUpdate}
        isBulkUpdate={selectedDotCongs.length > 1}
      />
      <UpdateStatusModal
        show={showUpdateStatus}
        handleClose={handleCloseUpdateStatus}
        handleUpdate={handleUpdateStatus}
        salaryData={selectedDotCong}
      />
    </div>
  );
};

export default ManagerWorkHoursStatus;
