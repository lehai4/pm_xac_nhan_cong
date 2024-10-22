import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {
  AttendanceGCGC,
  AttendanceMain,
  AttendanceTableHST,
} from "./WorkingHoursModal";

const CongComplaintModal = ({
  loaiPhieu,
  show,
  handleClose,
  congData,
  dateInput,
}) => {
  if (!congData) {
    return null; // Hoặc có thể return một loading spinner
  }
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết công và Câu hỏi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Thông tin nhân viên</h5>
        <p>Mã NV: {congData.ma_nv}</p>
        <p>
          Họ tên: {congData.ho} {congData.ten}
        </p>
        <p>Bộ phận: {congData.ten_bo_phan}</p>

        <h5 className="mt-4">Chi tiết công</h5>
        {loaiPhieu === "1" ? (
          <AttendanceTableHST data={congData} dateInput={dateInput} />
        ) : loaiPhieu === "2" ? (
          <AttendanceGCGC data={congData} />
        ) : loaiPhieu === "3" ? (
          <AttendanceMain data={congData} />
        ) : (
          <div>Không tìm thấy loại phiếu nào!</div>
        )}
        <h5 className="mt-4">Nội dung Câu hỏi</h5>
        <p>{congData.noi_dung_kn || "Không có nội dung Câu hỏi"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CongComplaintModal;
