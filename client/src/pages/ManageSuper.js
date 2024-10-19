import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import moment from "moment";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

const ManageDot = () => {
  const [activeTab, setActiveTab] = useState("managePermission");
  const [showModal, setShowModal] = useState(false);
  const [selectedDot, setSelectedDot] = useState(null); // ID của đợt lương được chọn
  const [salaryDots, setSalaryDots] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );

  const handleShow = (dot) => {
    setSelectedDot(dot);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedDot(null);
  };

  const handleLockDot = async () => {
    try {
      // Tìm đợt lương hiện tại
      const currentDot = salaryDots.find((dot) => dot.id === selectedDot);

      // Kiểm tra trạng thái hiện tại
      const newIsActive = currentDot.is_Active.data[0] === 1 ? 0 : 1; // Nếu đang hoạt động thì khóa, ngược lại mở

      // Gọi API để cập nhật trạng thái
      await axios.put(`${API_BASE_URL}/dotluong/active/update-is-active`, [
        { id: selectedDot, is_Active: newIsActive }, // Cập nhật is_Active
      ]);

      // Cập nhật lại danh sách đợt lương
      const updatedDots = salaryDots.map(
        (dot) =>
          dot.id === selectedDot
            ? { ...dot, is_Active: { data: [newIsActive] } }
            : dot // Cập nhật trạng thái mới
      );
      setSalaryDots(updatedDots);

      toast.success("Cập nhật thành công");
      handleClose();
    } catch (error) {
      console.error("Error updating salary dot:", error);
    }
  };
  // Lấy dữ liệu đợt lương bằng tháng
  const handleDotLuong = async (e) => {
    e.preventDefault();
    if (searchTerm) {
      try {
        const formattedMonth = moment(searchTerm).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotluong/month-no-active/${formattedMonth}`
        );
        setSalaryDots(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
        setSalaryDots([]);
      }
    } else {
      setSalaryDots([]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "manageDot":
        return (
          <div>
            <form className="needs-validation">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="new-month-salary" className="form-label">
                      Bảng lương tháng
                    </label>
                    <DatePicker
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      selected={searchTerm}
                      onChange={(date) => setSearchTerm(date)}
                      className="form-control"
                      id="new-month-salary"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-4 align-self-end">
                  <div className="mb-3">
                    <button
                      onClick={handleDotLuong}
                      className="btn btn-primary"
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <Table striped bordered hover className="responsiveTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đợt lương</th>
                  <th>Bảng lương tháng</th>
                  <th>Ngày thanh toán</th>
                  <th>Loại đợt lương</th>
                  <th>Trạng thái</th>
                  <th>Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {salaryDots.map((dot) => (
                  <tr key={dot.id}>
                    <td data-label="ID">{dot.id}</td>
                    <td data-label="Tên đợt lương">{dot.ten_dot}</td>
                    <td data-label="Bảng lương tháng">{dot.bang_luong_t}</td>
                    <td data-label="Ngày thanh toán">
                      {moment(dot.ngay_thanh_toan).format("DD/MM/YYYY")}
                    </td>
                    <td data-label="Loại đợt lương">
                      {dot.loai_phieu === "1" ? "Đầy đủ" : "Rút gọn"}
                    </td>
                    <td data-label="Trạng thái">
                      {
                        dot.is_Active.data[0] === 1 // Kiểm tra giá trị is_Active
                          ? "Đang hoạt động" // Hiển thị nếu is_Active = 1
                          : "Đã khóa" // Hiển thị nếu is_Active = 0
                      }
                    </td>
                    <td data-label="Hoạt động">
                      {dot.is_Active.data[0] === 1 ? (
                        <Button
                          variant="danger"
                          onClick={() => handleShow(dot.id)}
                        >
                          Khóa
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          onClick={() => handleShow(dot.id)}
                        >
                          Mở
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      case "managePermission":
        return (
          <div>
            <form className="needs-validation">
              <div className="row">
                <div className="form-group col-md-3">
                  <label htmlFor="employeeId" className="form-label">
                    Mã nhân viên
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="employeeId"
                    autoComplete="off"
                    placeholder="Nhập mã nhân viên"
                  />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="positionId" className="form-label">
                    Chức danh
                  </label>
                  <select className="form-select" id="positionId">
                    <option value>Chọn chức danh</option>
                    <option value="1">Admin</option>
                    <option value="2">Tiền lương</option>
                    <option value="3">Quản đốc X1</option>
                    <option value="4">Quản đốc X2</option>
                    <option value="5">Quản đốc X3</option>
                    <option value="6">Quản đốc X4</option>
                  </select>
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="departmentId" className="form-label">
                    Phòng ban
                  </label>
                  <select className="form-select" id="departmentId">
                    <option value>Chọn phòng ban</option>
                  </select>
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="departmentId" className="form-label">
                    Bộ phận
                  </label>
                  <select className="form-select" id="departmentId">
                    <option value>Chọn bộ phận</option>
                  </select>
                </div>
              </div>
              <div className="row justify-content-center mt-3">
                <div className="col-md-4 text-center ">
                  <button className="btn btn-primary">Tìm kiếm</button>
                </div>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h2>Trung tâm quản lý</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "managePermission" ? "active" : ""
            }`}
            onClick={() => setActiveTab("managePermission")}
          >
            Quản lý phân quyền
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "manageDot" ? "active" : ""}`}
            onClick={() => setActiveTab("manageDot")}
          >
            Quản lý đợt lương
          </button>
        </li>
      </ul>

      {renderContent()}

      {/* Modal để xác nhận khóa đợt lương */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {salaryDots.find((dot) => dot.id === selectedDot)?.is_Active
              .data[0] === 1
              ? "Xác nhận khóa đợt lương"
              : "Xác nhận mở đợt lương"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {salaryDots.find((dot) => dot.id === selectedDot)?.is_Active
            .data[0] === 1
            ? `Bạn có chắc chắn muốn khóa đợt lương với ID: ${selectedDot}?`
            : `Bạn có chắc chắn muốn mở đợt lương với ID: ${selectedDot}?`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>

          {salaryDots.find((dot) => dot.id === selectedDot)?.is_Active
            .data[0] === 1 ? (
            <Button variant="danger" onClick={handleLockDot}>
              Khóa
            </Button>
          ) : (
            <Button variant="success" onClick={handleLockDot}>
              Mở
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageDot;
