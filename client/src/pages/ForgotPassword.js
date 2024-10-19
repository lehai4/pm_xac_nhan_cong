import React from "react";
import { Link } from "react-router-dom";
import logo from "../photos/logo1.png";

function ForgotPassword() {
  return (
    <main className="d-flex w-100">
      <div className="container d-flex flex-column">
        <div className="row vh-100">
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto d-table h-100">
            <div className="d-table-cell align-middle">
              <img src={logo} className="img-fluid" alt="Việt Long Hưng" />
              <div className="text-center mt-4">
                <h1 className="h2">Quên mật khẩu</h1>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="m-sm-3">
                    <h4 className="lh-base">
                      Để được hỗ trợ lấy lại mật khẩu vui lòng liên hệ{" "}
                      <strong className="text-danger">Phòng Nhân sự</strong>
                    </h4>
                  </div>
                </div>
              </div>
              <div className="text-center mb-3">
                <Link to="/login">Quay lại trang đăng nhập</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
