import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import DatePicker from "react-datepicker";
import moment from "moment";
import { useAuth } from "../../hooks/useAuth";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const WorHoursStaffByTT = (ma_nv) => {
  const { isQL, isTT } = useAuth();
  const [congs, setCongs] = useState([]);
  const [dotCong, setDotCong] = useState([]);
  const [loaiPhieu, setLoaiPhieu] = useState([]);
  const [PhongBanArray, setPhongBanArray] = useState([]);
  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth())),
    // month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    periodName: "",
    employeeId: "",
    status: "Câu hỏi",
    bophan: "",
    phongban: "",
  });

  useEffect(() => {
    fetchData();
  }, [
    search.month,
    search.periodName,
    // search.status,
    ma_nv.ma_nv,
    search.phongban,
  ]);

  const fetchData = async () => {
    await DotCong();
    await LoaiPhieu();
    await fetchNhanVien();

    // Lấy dữ liệu phòng ban
    const fetchPhongBan = async () => {
      if (isTT) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/bophan/bophan-by-phutrach/${ma_nv.ma_nv}`
          );
          console.log("response:", response.data);
          setPhongBanArray(response.data);
        } catch (error) {
          setPhongBanArray([]);
        }
      } else {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/phongban/phongban-by-phutrach/${ma_nv.ma_nv}`
          );
          setPhongBanArray(response.data);
        } catch (error) {
          setPhongBanArray([]);
        }
      }
    };
    fetchPhongBan();
  };

  const LoaiPhieu = async () => {
    const response = await axios.get(
      `${API_BASE_URL}/dotcong/${search.periodName}`
    );
    setLoaiPhieu(response.data);
  };

  // Hiện modal Câu hỏi
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Lấy dữ liệu đợt cong
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

  const fetchNhanVien = useCallback(
    async (page = 1, applyFilters = false) => {
      try {
        const params = {
          page: page,
          limit: 20,
          phuTrach: ma_nv.ma_nv,
          loaiPhieu: loaiPhieu.loai_phieu,
          tinhTrang: search.status,
          idDot: search.periodName,
        };
        if (isQL) {
          params.phongban = search.phongban;
        }
        if (isTT) {
          params.bophan = search.bophan;
        }
        if (applyFilters) {
          if (search.employeeId.trim() !== "") {
            params.maNV = search.employeeId.trim();
          }
          if (search.bophan !== "") {
            params.bophan = search.bophan;
          }
        }

        console.log("params:", params);
        // Gọi API mới để lấy danh sách nhân viên
        const response = await axios.get(
          `${API_BASE_URL}/congs/cong-status/ttandql`,
          {
            params,
          }
        );
        console.log("response", response);
        const { data, pagination } = response.data;
        // Cập nhật trạng thái
        setCongs(data);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setCongs([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    [ma_nv.ma_nv, search, API_BASE_URL, loaiPhieu]
  );

  useEffect(() => {
    if (search.periodName) {
      fetchNhanVien(1, true);
    }
  }, [search.periodName, fetchNhanVien]);

  const handleSearchChange = useCallback((name, value) => {
    setSearch((prev) => {
      const newSearch = {
        ...prev,
        [name]: value === null ? "" : value,
      };
      return newSearch;
    });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNhanVien(page);
  };

  useEffect(() => {
    console.log("Phiếu", loaiPhieu.loai_phieu);
  }, [loaiPhieu]);
  // Nhập lý do
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState({
    create_time: new Date(),
    ly_do: "",
    nguoi_nhap: "",
  });
  const [currentCongId, setCurrentCongId] = useState({
    id_he_so_thuong: null,
    id_gio_cong_gian_ca: null,
    id_cong_main: null,
    id_dot: null,
  }); // ID của nhân viên hiện tại
  const [isSubmitted, setIsSubmitted] = useState(false); // Thay đổi để theo dõi trạng thái gửi cho từng nhân viên

  const handleShow = (idCongDot, id_bangcong_nhanvien) => {
    console.log("idCongDot", idCongDot);
    console.log("id_bangcong_nhanvien", id_bangcong_nhanvien);

    setCurrentCongId({
      id_he_so_thuong:
        loaiPhieu.loai_phieu === "1" ? id_bangcong_nhanvien : null,
      id_gio_cong_gian_ca:
        loaiPhieu.loai_phieu === "2" ? id_bangcong_nhanvien : null,
      id_cong_main: loaiPhieu.loai_phieu === "3" ? id_bangcong_nhanvien : null,
      id_dot: idCongDot,
    }); // Cập nhật ID của nhân viên hiện tại
    setShowModal(true);
  };

  useEffect(() => {
    console.log("currentCongId", currentCongId);
  }, [currentCongId]);

  const handleClose = () => setShowModal(false);

  const handleSubmitLyDo = async () => {
    if (reason.ly_do === "") {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    const statusLuong = {
      id_he_so_thuong:
        loaiPhieu.loai_phieu === "1" ? currentCongId.id_he_so_thuong : null, // Sử dụng currentCongId để xác định ID
      id_gio_cong_gian_ca:
        loaiPhieu.loai_phieu === "2" ? currentCongId.id_gio_cong_gian_ca : null,
      id_cong_main:
        loaiPhieu.loai_phieu === "3" ? currentCongId.id_cong_main : null,
      id_dot: currentCongId.id_dot, // Cần đảm bảo rằng bạn có id_dot cho nhân viên này
      tinh_trang: "Cập nhật lý do", // Sử dụng lý do để xác định trạng thái
      ly_do: reason.ly_do,
      nguoi_nhap: ma_nv.ma_nv,
      create_time: new Date(),
    };
    console.log("statusLuong", statusLuong);
    try {
      // Gửi yêu cầu POST đến API
      await axios.post(`${API_BASE_URL}/statusCong`, [statusLuong]);

      toast.success("Gửi lý do thành công");

      // Cập nhật lại lý do
      setReason({
        create_time: new Date(),
        ly_do: "",
        nguoi_nhap: "",
      });

      // Đánh dấu là đã gửi cho nhân viên hiện tại
      setIsSubmitted(true);

      // Gọi lại hàm fetchNhanVien để đồng bộ dữ liệu
      await fetchNhanVien(1, true); // Đảm bảo rằng hàm này trả về một Promise
    } catch (error) {
      console.error("Error submitting reason:", error); // Xử lý lỗi nếu có
    }

    // Đóng modal sau khi gửi
    handleClose();
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const ellipsis = (
      <li key="ellipsis" className="page-item disabled">
        <span className="page-link">...</span>
      </li>
    );

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(ellipsis);
      pageNumbers.push(totalPages);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
          </li>
          {pageNumbers.map((number, index) =>
            typeof number === "number" ? (
              <li
                key={index}
                className={`page-item ${
                  currentPage === number ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              </li>
            ) : (
              number
            )
          )}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

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
                  disabled={true}
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
              <div className="mb-3">
                <label htmlFor="bophan" className="form-label">
                  Đơn vị
                </label>
                <select
                  className="form-select"
                  id="bophan"
                  value={isTT ? search.bophan : search.phongban}
                  onChange={(e) =>
                    handleSearchChange(
                      isTT ? "bophan" : "phongban",
                      e.target.value
                    )
                  }
                  autoComplete="off"
                >
                  <option value="">CHỌN BỘ PHẬN</option>
                  {isQL
                    ? PhongBanArray.sort((a, b) =>
                        a.ten_phong_ban.localeCompare(b.ten_phong_ban)
                      ).map((bophan) => (
                        <option key={bophan.id} value={bophan.id}>
                          {bophan.ten_phong_ban}
                        </option>
                      ))
                    : PhongBanArray.sort((a, b) =>
                        a.ten_bo_phan.localeCompare(b.ten_bo_phan)
                      ).map((bophan) => (
                        <option key={bophan.id} value={bophan.id}>
                          {bophan.ten_bo_phan}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="ma" className="form-label">
                  Trạng thái
                </label>
                <select
                  className="form-select"
                  id="status"
                  value={search.status}
                  onChange={(e) => handleSearchChange("status", e.target.value)}
                  autoComplete="off"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Câu hỏi">Câu hỏi</option>
                  <option value="Đã xác nhận">Đã xác nhận</option>
                  <option value="Chưa xác nhận">Chưa xác nhận</option>
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
        </form>

        {congs.length > 0 ? (
          <div className="mt-4">
            <h5>Kết quả tìm kiếm {congs.length} bản ghi</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Bộ phận</th>
                  {search.periodName && (
                    <>
                      <th>Trạng thái</th>
                      <th className="text-center">Lý do không xác nhận</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {congs.map((cong, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{cong.ma_nv}</td>
                    <td>{cong.ten_nv}</td>
                    <td>{cong.ten_bo_phan}</td>
                    {search.periodName && (
                      <>
                        <td>
                          {cong.l_id
                            ? cong.tinh_trang || "Chưa có trạng thái"
                            : "Không có công"}
                        </td>
                        <td className="text-center">
                          {cong.tinh_trang ? (
                            <>
                              {cong.tinh_trang ===
                              "Đã gửi lý do chưa xác nhận" ? (
                                <span>{cong.l_ly_do || "Không có lý do"}</span>
                              ) : cong.tinh_trang !== search.status ? (
                                <span>Khác ({cong.tinh_trang})</span>
                              ) : cong.tinh_trang === "Chưa xác nhận" ? (
                                <button
                                  className="btn btn-primary mx-2"
                                  onClick={() =>
                                    handleShow(cong.id_dot_dong, cong.l_id)
                                  }
                                >
                                  Nhập lý do
                                </button>
                              ) : (
                                <span>{cong.tinh_trang}</span>
                              )}
                            </>
                          ) : cong.l_id ? (
                            <>
                              <button
                                className="btn btn-primary mx-2"
                                onClick={() =>
                                  handleShow(cong.id_dot_cong, cong.l_id)
                                }
                              >
                                Nhập lý do
                              </button>
                            </>
                          ) : (
                            <span>Không có công</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
            <Modal show={showModal} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Nhập lý do không xác nhận</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="reasonTextarea">
                    <Form.Label>Lý do</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reason.ly_do}
                      onChange={
                        (e) => setReason({ ...reason, ly_do: e.target.value }) // Cập nhật lý do
                      }
                      placeholder="Nhập lý do tại đây..."
                      required
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmitLyDo}>
                  Gửi
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <div className="mt-4">
            {search.status === "Câu hỏi" ? (
              <h5>Không tìm thấy thông tin Câu hỏi</h5>
            ) : search.status === "Đã xác nhận" ? (
              <h5>Không tìm thấy thông tin Đã xác nhận</h5>
            ) : (
              <h5>Không tìm thấy thông tin Chưa xác nhận</h5>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorHoursStaffByTT;
