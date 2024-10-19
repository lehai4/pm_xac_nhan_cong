import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import SalaryDetailModal from "../components/Model/SalaryDetailModal";

const SuperSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [dotLuong, setDotLuong] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({
    periodName: "",
    employeeId: "",
    month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchDotLuong(), fetchEmployees(currentPage)]);
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
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      setEmployees([]);
      throw error;
    }
  };

  const fetchDotLuong = async () => {
    if (search.month) {
      try {
        const formattedMonth = moment(search.month).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotluong/month/${formattedMonth}`
        );
        setDotLuong(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
        setDotLuong([]);
        throw error;
      }
    } else {
      setDotLuong([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      if (response.data) {
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

  // Xem chi tiết
  const [currentView, setCurrentView] = useState("chi_trong");
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleViewSalary = useCallback(
    async (ma_nv) => {
      try {
        // Fetch Chi Trong data
        let chiTrong = [];
        try {
          const chiTrongResponse = await axios.get(
            `${API_BASE_URL}/chitrong/active-chitrong-sp/${ma_nv}`
          );
          chiTrong = chiTrongResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu Chi Trong");
          } else {
            throw error;
          }
        }

        // Fetch Chi Ngoai data
        let chiNgoai = [];
        try {
          const chiNgoaiResponse = await axios.get(
            `${API_BASE_URL}/chingoai/active-chingoai-sp/${ma_nv}`
          );
          chiNgoai = chiNgoaiResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu Chi Ngoai");
          } else {
            throw error;
          }
        }

        if (chiTrong.length > 0 || chiNgoai.length > 0) {
          setSelectedEmployee({
            ma_nv,
            chi_trong: chiTrong,
            chi_ngoai: chiNgoai,
          });

          // Mặc định hiển thị Chi Trong nếu có, nếu không thì hiển thị Chi Ngoai
          setCurrentView(chiTrong.length > 0 ? "chi_trong" : "chi_ngoai");
          setShowSalaryModal(true);
        } else {
          // Hiển thị modal không có dữ liệu
          setNoDataMessage("Không tìm thấy thông tin lương cho nhân viên này.");
          setShowNoDataModal(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Có lỗi xảy ra khi lấy thông tin lương. Vui lòng thử lại.");
      }
    },
    [API_BASE_URL]
  );
  // Phan trang
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

  return (
    <div className="tab-pane fade show active" role="tabpanel">
      <div className="container-fluid py-3">
        <h4 className="text-center mb-4 text-primary h2 fw-bold">
          TỔNG HỢP LƯƠNG
        </h4>
        <form className="needs-validation" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative w-100">
                <label htmlFor="new-month-salary" className="form-label">
                  Bảng lương tháng
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
          <h5>Danh sách nhân viên</h5>
          {isLoading ? (
            <div className="text-center">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-center text-danger">{error}</div>
          ) : employees.length > 0 ? (
            <>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Tên NV</th>
                    <th>Bộ phận</th>
                    <th>Xem lương</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.ma_nv}</td>
                      <td>{employee.ten_nv}</td>
                      <td>{employee.ten_bo_phan}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewSalary(employee.ma_nv)}
                        >
                          Xem lương
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </>
          ) : (
            <p>Không có dữ liệu nhân viên.</p>
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
      <SalaryDetailModal
        employee={selectedEmployee}
        show={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
    </div>
  );
};

export default SuperSalary;
