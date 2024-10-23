import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import moment from "moment";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

const SupperEachWorkHours = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDot, setSelectedDot] = useState(null); // ID của đợt lương được chọn
  const [workHoursDots, setWorkHoursDots] = useState([]);
  const [searchTerm, setSearchTerm] = useState(new Date());

  const handleShow = (dot) => {
    setSelectedDot(dot);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedDot(null);
  };

  const handleDotCong = async (e) => {
    e.preventDefault();
    if (searchTerm) {
      try {
        const formattedMonth = moment(searchTerm).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotcong/month-no-active/${formattedMonth}`
        );
        setWorkHoursDots(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt công:", error);
        setWorkHoursDots([]);
      }
    } else {
      setWorkHoursDots([]);
    }
  };

  const handleLockDot = async () => {
    try {
      // Tìm đợt công hiện tại
      const currentDot = workHoursDots.find((dot) => dot.id === selectedDot);

      // Kiểm tra trạng thái hiện tại
      const newIsActive = currentDot.is_Active.data[0] === 1 ? 0 : 1; // Nếu đang hoạt động thì khóa, ngược lại mở

      // Gọi API để cập nhật trạng thái
      await axios.put(`${API_BASE_URL}/dotcong/active/update-is-active`, [
        { id: selectedDot, is_Active: newIsActive }, // Cập nhật is_Active
      ]);

      // Cập nhật lại danh sách đợt công
      const updatedDots = workHoursDots.map(
        (dot) =>
          dot.id === selectedDot
            ? { ...dot, is_Active: { data: [newIsActive] } }
            : dot // Cập nhật trạng thái mới
      );
      setWorkHoursDots(updatedDots);

      toast.success("Cập nhật thành công");
      handleClose();
    } catch (error) {
      console.error("Error updating workhours dot:", error);
    }
  };
  return (
    <div className="container mt-4">
      <h2>Quản lý đợt công</h2>
      <form className="needs-validation">
        <div className="row">
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="new-month-work-hours" className="form-label">
                Bảng công tháng
              </label>
              <DatePicker
                dateFormat="MM/yyyy"
                showMonthYearPicker
                selected={searchTerm}
                onChange={(date) => setSearchTerm(date)}
                className="form-control"
                id="new-month-work-hours"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-md-4 align-self-end">
            <div className="mb-3">
              <button onClick={handleDotCong} className="btn btn-primary">
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
            <th>Tên đợt công</th>
            <th>Bảng công tháng</th>
            <th>Loại đợt công</th>
            <th>Trạng thái</th>
            <th>Hoạt động</th>
          </tr>
        </thead>
        <tbody>
          {workHoursDots.map((dot) => (
            <tr key={dot.id}>
              <td data-label="ID">{dot.id}</td>
              <td data-label="Tên đợt công">{dot.ten_dot}</td>
              <td data-label="Bảng công tháng">{dot.bang_cong_t}</td>
              <td data-label="Loại đợt lương">
                {dot.loai_phieu === "1"
                  ? "Hệ số thưởng"
                  : dot.loai_phieu === "2"
                  ? "Giờ công giãn ca"
                  : "Công chính"}
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
                  <Button variant="danger" onClick={() => handleShow(dot.id)}>
                    Khóa
                  </Button>
                ) : (
                  <Button variant="success" onClick={() => handleShow(dot.id)}>
                    Mở
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal để xác nhận khóa đợt công */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {workHoursDots.find((dot) => dot.id === selectedDot)?.is_Active
              .data[0] === 1
              ? "Xác nhận khóa đợt công"
              : "Xác nhận mở đợt công"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {workHoursDots.find((dot) => dot.id === selectedDot)?.is_Active
            .data[0] === 1
            ? `Bạn có chắc chắn muốn khóa đợt công với ID: ${selectedDot}?`
            : `Bạn có chắc chắn muốn mở đợt công với ID: ${selectedDot}?`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>

          {workHoursDots.find((dot) => dot.id === selectedDot)?.is_Active
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

export default SupperEachWorkHours;
