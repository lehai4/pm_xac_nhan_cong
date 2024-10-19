import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../photos/logo1.png";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL, API_LOGIN } from "../config/api";
import socket from "../config/socketio";

function Login() {
  const [manv, setManv] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
    alert("Đăng xuất");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Login attempt with:", { MaNV: manv, MatKhau: password });
    const data = { MaNV: manv, MatKhau: password };
    socket.emit("login", data);
  };

  useEffect(() => {
    socket.on("login_success", (data) => {
      console.log("Login success data:", data);
      localStorage.setItem("token", data.data.token);
      const user = data.data.user;
      Object.keys(user).forEach((key) => {
        localStorage.setItem(key, user[key]);
      });
      localStorage.setItem("socketId", socket.id);
      window.location.href = "/";
    });

    socket.on("force_logout", (data) => {
      console.log(data);
      console.log("Force logout:", data);
      handleLogout();
    });

    socket.on("login_failed", (data) => {
      console.log("Login failed:", data);
      setError(data.message);
    });

    return () => {
      console.log("Login component unmounting");
      socket.off("login_success");
      socket.off("force_logout");
      socket.off("login_failed");
    };
  }, []);

  return (
    <main className="d-flex w-100">
      <div className="container d-flex flex-column">
        <div className="row vh-100">
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto d-table h-100">
            <div className="d-table-cell align-middle">
              <img src={logo} className="img-fluid" alt="Việt Long Hưng" />
              <div className="text-center mt-4">
                <h1 className="h2">Trang tiện ích nội bộ</h1>
                <p className="lead">Đăng nhập để tiếp tục</p>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="m-sm-3">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Mã nhân viên</label>
                        <input
                          className="form-control form-control-lg"
                          type="tel"
                          name="employeeId"
                          placeholder="Mã nhân viên 5 số"
                          pattern="[0-9]{5}"
                          required
                          value={manv}
                          onChange={(e) => setManv(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                          className="form-control form-control-lg"
                          type="password"
                          name="password"
                          placeholder="Nhập mật khẩu"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="d-grid gap-2 mt-3">
                        <button
                          type="submit"
                          className="btn btn-lg btn-primary"
                        >
                          Đăng nhập
                        </button>
                      </div>
                      {error && (
                        <p className="my-3 text-center alert alert-danger">
                          {error}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              <div className="text-center mb-3">
                <Link to="/forgot-password">Quên mật khẩu</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;