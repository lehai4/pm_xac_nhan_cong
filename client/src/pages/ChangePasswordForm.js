import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { API_LOGIN } from "../config/api";
import { toast } from "react-toastify";
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_LOGIN}/update-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Đổi mật khẩu thành công");
    } catch (error) {
      toast.error(
        "Lỗi khi đổi mật khẩu:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <h2 className="mb-4">Đổi mật khẩu</h2>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
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
            <div className="mb-3">
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
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordForm;
