import React from "react";
import FeatherIcon from "feather-icons-react";

const ProfileModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content ">
          <div className="modal-header bg-info bg-gradient">
            <h5 className="modal-title">Thông tin cá nhân</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <FeatherIcon icon="user" className="me-2" />
              <strong>Tên:</strong> {userData.ten_nv}
            </div>
            <div className="mb-3">
              <FeatherIcon icon="slack" className="me-2" />
              <strong>Mã nhân viên:</strong> {userData.ma_nv}
            </div>
            <div className="mb-3">
              <FeatherIcon icon="credit-card" className="me-2" />
              <strong>6 số cuối CCCD:</strong> {userData.cccd}
            </div>
            <div className="mb-3">
              <FeatherIcon icon="phone" className="me-2" />
              <strong>Số điện thoại:</strong> {userData.dien_thoai}
            </div>
            {/* Thêm các thông tin khác nếu cần */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
