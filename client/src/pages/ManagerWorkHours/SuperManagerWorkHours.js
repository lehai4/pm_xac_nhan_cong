import React, { useState, useCallback, useEffect } from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "../../config/api";
import WorkingHoursModal from "../../components/Model/WorkingHoursModal";

const SuperManagerWorkHours = () => {
  const [currentView, setCurrentView] = useState("cong_main");
  const [employees, setEmployees] = useState([]);
  const [employeesDefault, setEmployeesDefault] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dotCong, setDotCong] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({
    periodName: "",
    employeeId: "",
    month: new Date(),
  });

  const [showModal, setShowModal] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchDotCong(), fetchEmployees(currentPage)]);
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  const fetchEmployees = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nhanvien/limit?page=${page}&limit=50`
      );
      setEmployees(response.data.nhanViens);
      setEmployeesDefault(response.data.nhanViens);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      setEmployees([]);
      throw error;
    }
  };

  const fetchDotCong = async () => {
    if (search.month) {
      try {
        const formattedMonth = moment(search.month).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotcong/month/${formattedMonth}`
        );
        setDotCong(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu công:", error);
        setDotCong([]);
        throw error;
      }
    } else {
      setDotCong([]);
    }
  };

  const handleSearchChange = (name, value) => {
    setSearch((prev) => ({
      ...prev,
      [name]: value === null ? "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmployees([]);

    if (!search.employeeId.trim()) {
      setError("Vui lòng nhập mã nhân viên");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/nhanvien/bymanvlike/${encodeURIComponent(
          search.employeeId.trim()
        )}`
      );
      console.log(response.data);
      if (response.data.length > 0) {
        setEmployees(response.data);
        setTotalPages(1);
        setCurrentPage(1);
        toast.success("Tìm kiếm thành công!");
      } else {
        setError("Không tìm thấy thông tin nhân viên");
        toast.warning("Không tìm thấy thông tin nhân viên");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thông tin nhân viên:", error);

      if (error.response) {
        if (error.response.status === 404) {
          setError("Không tìm thấy thông tin nhân viên");
          toast.warning("Không tìm thấy thông tin nhân viên");
        } else {
          setError(`Lỗi server: ${error.response.status}`);
          toast.error(`Lỗi server: ${error.response.status}`);
        }
      } else if (error.request) {
        setError("Không thể kết nối đến server");
        toast.error("Không thể kết nối đến server");
      } else {
        setError("Đã xảy ra lỗi khi tìm kiếm");
        toast.error("Đã xảy ra lỗi khi tìm kiếm");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số lượng trang tối đa hiển thị

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
          </li>
          {pageNumbers}
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
              Sau
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const rollback = () => {
    setError(null);
    setEmployees(employeesDefault);
  };

  const handleViewWorkHours = async (ma_nv) => {
    try {
      // Fetch hesothuong data
      let hst = [];
      try {
        const heSoThuongResponse = await axios.post(
          `${API_BASE_URL}/dotcong/active-he-so-thuong-sp/${ma_nv}`,
          search
        );
        hst = heSoThuongResponse.data || [];
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Không tìm thấy dữ liệu Hệ Số Thưởng");
        } else {
          throw error;
        }
      }

      // Fetch gio cong gian cadata
      let gcgc = [];
      try {
        const gioCongGianCAResponse = await axios.post(
          `${API_BASE_URL}/dotcong/active-gio-cong-gian-ca-sp/${ma_nv}`,
          search
        );
        gcgc = gioCongGianCAResponse.data || [];
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Không tìm thấy dữ liệu Giờ Công Giãn Ca");
        } else {
          throw error;
        }
      }
      let congmain = [];
      try {
        const congMainResponse = await axios.post(
          `${API_BASE_URL}/dotcong/active-cong-main-sp/${ma_nv}`,
          search
        );
        congmain = congMainResponse.data || [];
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Không tìm thấy dữ liệu Công Main");
        } else {
          throw error;
        }
      }

      if (hst.length > 0 || gcgc.length > 0 || congmain.length > 0) {
        setSelectedEmployee({
          ma_nv,
          he_so_thuong: hst,
          gio_cong_gian_ca: gcgc,
          cong_main: congmain,
        });

        setShowModal(true);
      } else {
        // Hiển thị modal không có dữ liệu
        setNoDataMessage("Không tìm thấy thông tin công cho nhân viên này.");
        setShowNoDataModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      alert("Có lỗi xảy ra khi lấy thông tin công. Vui lòng thử lại.");
    }
  };

  const onClose = () => {
    setShowModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchDotCong();
  }, [search.month]);

  if (isLoading) {
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <>
        <div className="text-center mt-5 text-danger">{error}</div>
        <div className="text-center mt-4">
          <button onClick={rollback}>Quay lại</button>
        </div>
      </>
    );
  }

  return (
    <div className="tab-pane fade show active" role="tabpanel">
      <div className="container-fluid py-3">
        <h4 className="text-center mb-4 text-primary h2 fw-bold">
          TỔNG HỢP CÔNG
        </h4>
        <form className="needs-validation" onSubmit={handleSubmit}>
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
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
              </button>
            </div>
          </div>
        </form>

        {/* Hiển thị danh sách nhân viên */}
        <div className="mt-4">
          <h5>Danh sách công nhân viên</h5>
          {isLoading ? (
            <div className="text-center">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-center mt-5">{error}</div>
          ) : employees.length > 0 && dotCong.length > 0 ? (
            <>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Tên NV</th>
                    <th>Bộ phận</th>
                    <th>Xem công</th>
                  </tr>
                </thead>
                <tbody>
                  {employees?.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.ma_nv}</td>
                      <td>{employee.ten_nv}</td>
                      <td>{employee.ten_bo_phan}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewWorkHours(employee.ma_nv)}
                        >
                          Xem công
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </>
          ) : (
            <p>Không có dữ liệu công nhân viên.</p>
          )}
        </div>
        {showNoDataModal && (
          <div
            className="modal"
            tabIndex="-1"
            role="dialog"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Thông báo</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNoDataModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">{noDataMessage}</div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNoDataModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <WorkingHoursModal
          employee={selectedEmployee}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default SuperManagerWorkHours;
