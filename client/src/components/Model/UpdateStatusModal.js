import React from "react";
import { Modal, Button } from "react-bootstrap";

const UpdateStatusModal = ({ show, handleClose, handleUpdate }) => {
  const handleApprove = () => {
    handleUpdate("Đã cập nhật lý do chưa xác nhận");
    handleClose();
  };

  const handleReject = () => {
    handleUpdate("Chưa xác nhận");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật trạng thái</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn muốn duyệt lý do này hay không?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="danger" onClick={handleReject}>
          Không duyệt
        </Button>
        <Button variant="success" onClick={handleApprove}>
          Duyệt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateStatusModal;
