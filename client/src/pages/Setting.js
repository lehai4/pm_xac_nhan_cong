import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, API_LOGIN } from "../config/api";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
const Setting = () => {
  const [activeTab, setActiveTab] = useState("employeeList");
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [cccd, setCccd] = useState("");
  const limit = 50; // Số lượng nhân viên trên mỗi trang

  useEffect(() => {
    if (activeTab === "employeeList") {
      fetchEmployees(currentPage);
    }
  }, [activeTab, currentPage]);

  const fetchEmployees = async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/nhanvien/limit`, {
        params: { page, limit, search: searchTerm },
      });
      setEmployees(response.data.nhanViens);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchEmployee = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEditEmployee = (manv) => {
    setCccd("");
    setSelectedEmployee(manv);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setError(null);
  };

  const handleSaveChanges = async () => {
    if (cccd === "") {
      setError("6 số cuối CCCD không được để trống");
      return;
    }

    try {
      await axios.post(`${API_LOGIN}/reset-password`, {
        MaNV: selectedEmployee,
      });
      toast.success("Cập nhật thông tin nhân viên thành công");
      handleCloseModal();
      setError(null);
    } catch (error) {
      console.error("Error updating employee info:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin nhân viên");
      setShowModal(true);
      setError(null);
    }
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

  const renderContent = () => {
    switch (activeTab) {
      case "resetPassword":
        return (
          <form>
            <div className="form-group mb-3">
              <label htmlFor="employeeId" className="form-label">
                Mã nhân viên
              </label>
              <input
                type="text"
                className="form-control"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="newPassword" className="form-label">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Đặt lại mật khẩu
            </button>
          </form>
        );
      case "employeeList":
        return (
          <div>
            <form onSubmit={handleSearchEmployee} className="mb-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã nhân viên hoặc tên"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Tìm kiếm
                </button>
              </div>
            </form>
            {isLoading ? (
              <p>Đang tải dữ liệu...</p>
            ) : employees && employees.length > 0 ? (
              <>
                <table className="table table-striped table-bordered responsiveTable">
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-center">STT</th>
                      <th>Mã NV</th>
                      <th>Tên nhân viên</th>
                      <th>Bộ Phận</th>
                      <th>CCCD</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td data-label="STT" className="text-center">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td data-label="Mã NV">{employee.ma_nv}</td>
                        <td data-label="Tên nhân viên">{employee.ten_nv}</td>
                        <td data-label="Bộ Phận">{employee.ten_bo_phan}</td>
                        <td data-label="CCCD">{employee.cccd}</td>
                        <td data-label="Hành động">
                          <button
                            onClick={() => handleEditEmployee(employee.ma_nv)}
                            className="btn btn-primary btn-sm"
                          >
                            Reset Password
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "employeeList" ? "active" : ""
            }`}
            onClick={() => setActiveTab("employeeList")}
          >
            Danh sách nhân viên
          </button>
        </li>
      </ul>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật lại mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <form>
              <div className="mb-3">
                <label htmlFor="maNV" className="form-label">
                  Mã NV
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="maNV"
                  value={selectedEmployee}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cccd" className="form-label">
                  6 số cuối CCCD
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cccd"
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <div className="alert alert-warning" role="alert">
                  Lưu ý: Hệ thống sẽ cập nhật lại mật khẩu nhân viên
                </div>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
      {renderContent()}
    </div>
  );
};

export default Setting;
