import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../photos/icon1.jpg";
import { Dropdown } from "bootstrap"; // Import Dropdown từ bootstrap
import FeatherIcon from "feather-icons-react";
import ProfileModal from "./Model/ProfileModal.js";
import { useAuth } from "../hooks/useAuth.js";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

function Navbar({ onToggleSidebar, handlerLogOut, ten_nv, ma_nv }) {
  const { isAdmin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  useEffect(() => {
    // Khởi tạo tất cả các dropdowns
    const dropdownElementList = [].slice.call(
      document.querySelectorAll(".dropdown-toggle")
    );
    dropdownElementList.map(function (dropdownToggleEl) {
      return new Dropdown(dropdownToggleEl);
    });

    getUserData();
  }, [ma_nv, API_BASE_URL]);

  const getUserData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nhanvien/bymanv/${ma_nv}`
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const openProfileModal = (e) => {
    e.preventDefault();
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand navbar-light navbar-bg"
        style={{ width: "inherit" }}
      >
        <a
          className="sidebar-toggle js-sidebar-toggle mx-3"
          onClick={onToggleSidebar}
        >
          <i className="hamburger align-self-center"></i>
        </a>

        <div className="navbar-collapse collapse">
          <ul className="navbar-nav navbar-align">
            <li className="nav-item dropdown">
              {/* Icon Dropdown Phone */}
              <a
                className="nav-icon dropdown-toggle d-inline-block d-sm-none"
                href="#"
                data-bs-toggle="dropdown"
              >
                <FeatherIcon className="align-middle" icon="settings" />
              </a>

              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block"
                href="#"
                data-bs-toggle="dropdown"
              >
                <img
                  src={logo}
                  className="avatar img-fluid rounded me-1"
                  alt="LOGO"
                />
                <span className="text-dark">{ten_nv}</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end">
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={openProfileModal}
                >
                  <FeatherIcon icon="user" className="align-middle me-1" />{" "}
                  Thông tin cá nhân
                </a>
                <Link className="dropdown-item" to="/change-password">
                  <FeatherIcon icon="lock" className="align-middle me-1" /> Đổi
                  mật khẩu
                </Link>
                <div className="dropdown-divider"></div>
                {isAdmin && (
                  <Link className="dropdown-item" to="/settings">
                    <FeatherIcon
                      icon="settings"
                      className="align-middle me-1"
                    />{" "}
                    Reset mật khẩu
                  </Link>
                )}
                {/* <Link className="dropdown-item" to="/settings">
                  <FeatherIcon icon="settings" className="align-middle me-1" />{" "}
                  Reset mật khẩu
                </Link> */}
                <Link className="dropdown-item" to="/user-guide">
                  <FeatherIcon
                    icon="help-circle"
                    className="align-middle me-1"
                  />{" "}
                  Hỗ trợ
                </Link>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#" onClick={handlerLogOut}>
                  Đăng xuất
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        userData={userData}
      />
    </>
  );
}

export default Navbar;
