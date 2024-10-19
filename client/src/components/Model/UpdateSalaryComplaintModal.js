import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const UpdateSalaryComplaintModal = ({
  show,
  handleClose,
  onUpdate,
  isBulkUpdate,
}) => {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(status);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isBulkUpdate
            ? "Cập nhật trạng thái hàng loạt"
            : "Cập nhật trạng thái"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Chọn trạng thái</option>
              <option value="Đang xem">Đang xem</option>
              <option value="Chưa xác nhận">Chưa xác nhận</option>
              <option value="Dữ liệu đúng không cập nhật">
                Dữ liệu đúng không cập nhật
              </option>
              <option value="Cập nhật lại dữ liệu">Cập nhật lại dữ liệu</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" type="submit">
            Cập nhật
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateSalaryComplaintModal;
