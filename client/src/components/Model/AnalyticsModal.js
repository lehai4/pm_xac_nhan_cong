import React from "react";
import FeatherIcon from "feather-icons-react";

const AnalyticsModal = ({ isOpen, onClose, analyticsData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Analytics</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FeatherIcon icon="users" className="me-2" />
                      Tổng số nhân viên
                    </h5>
                    <p className="card-text display-4">
                      {analyticsData.totalEmployees}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FeatherIcon icon="dollar-sign" className="me-2" />
                      Tổng lương tháng này
                    </h5>
                    <p className="card-text display-4">
                      {analyticsData.totalSalary.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <h5>
                  <FeatherIcon icon="bar-chart-2" className="me-2" />
                  Biểu đồ lương theo phòng ban
                </h5>
                {/* Ở đây bạn có thể thêm một component biểu đồ, ví dụ sử dụng Chart.js hoặc Recharts */}
                <p>Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>
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

export default AnalyticsModal;
