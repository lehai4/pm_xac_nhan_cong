import React from "react";
import { Link, useLocation } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { useAuth } from "../hooks/useAuth"; // Import hook useAuth

function Sidebar({ isCollapsed, isMobile, isOpen, onToggleSidebar }) {
  const location = useLocation();
  const { isAdmin, isQL, isTT, isSUPER } = useAuth();

  const isActive = (path) => (location.pathname === path ? "active" : "");
  const sidebarClass = `sidebar js-sidebar ${
    isCollapsed && !isMobile ? "collapsed" : ""
  } ${isMobile ? (isOpen ? "open" : "") : ""}`;

  return (
    <nav id="sidebar" className={sidebarClass}>
      <div className="sidebar-content js-simplebar overflow-y-scroll">
        <Link className="sidebar-brand" to="/">
          <span className="align-middle">Chức năng</span>
        </Link>

        <ul className="sidebar-nav mb-5">
          {isAdmin && ( // Chỉ hiển thị phần này nếu là admin
            <>
              <li className="sidebar-header">Quản trị</li>
              <li className={`sidebar-item ${isActive("/")}`}>
                <Link className="sidebar-link" to="/">
                  <FeatherIcon icon="activity" className="align-middle" />
                  <span className="align-middle">Thống kê</span>
                </Link>
              </li>
              <li className={`sidebar-item ${isActive("/manage-salary")}`}>
                <Link className="sidebar-link" to="/manage-salary">
                  <FeatherIcon icon="command" className="align-middle" />
                  <span className="align-middle">Quản lý trạng thái</span>
                </Link>
              </li>
              <li className={`sidebar-item ${isActive("/upload-salary")}`}>
                <Link className="sidebar-link" to="/upload-salary">
                  <FeatherIcon icon="upload" className="align-middle" />
                  <span className="align-middle">Tải lên bảng lương</span>
                </Link>
              </li>
              <li className={`sidebar-item ${isActive("/settings")}`}>
                <Link className="sidebar-link" to="/settings">
                  <FeatherIcon icon="settings" className="align-middle" />
                  <span className="align-middle">Reset mật khẩu</span>
                </Link>
              </li>
            </>
          )}
          {isSUPER && (
            <>
              <li className={`sidebar-item ${isActive("/super-salary")}`}>
                <Link
                  className="sidebar-link"
                  to="/super-salary"
                  onClick={onToggleSidebar}
                >
                  <FeatherIcon icon="cpu" className="align-middle" />
                  <span className="align-middle">Quản lý lương</span>
                </Link>
              </li>
              <li className={`sidebar-item ${isActive("/super-manage")}`}>
                <Link className="sidebar-link" to="/super-manage">
                  <FeatherIcon icon="archive" className="align-middle" />
                  <span className="align-middle">Trung tâm quản lý</span>
                </Link>
              </li>
            </>
          )}
          <li className="sidebar-header">Công</li>
          {isSUPER && (
            <>
              <li
                className={`sidebar-item ${isActive(
                  "/manage-workhours-status"
                )}`}
              >
                <Link className="sidebar-link" to="/manage-workhours-status">
                  <FeatherIcon icon="command" className="align-middle" />
                  <span className="align-middle">Quản lý trạng thái</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive("/upload-working-hours")}`}
              >
                <Link className="sidebar-link" to="/upload-working-hours">
                  <FeatherIcon icon="upload" className="align-middle" />
                  <span className="align-middle">Tải lên bảng công</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive(
                  "/super-management-workhours"
                )}`}
              >
                <Link className="sidebar-link" to="/super-management-workhours">
                  <FeatherIcon icon="cpu" className="align-middle" />
                  <span className="align-middle">Quản lý công</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive("/supper-each-workhours")}`}
              >
                <Link className="sidebar-link" to="/supper-each-workhours">
                  <FeatherIcon icon="archive" className="align-middle" />
                  <span className="align-middle">Quản lý đợt công</span>
                </Link>
              </li>
            </>
          )}
          {(isQL || isTT) && (
            <>
              <li
                className={`sidebar-item ${isActive(
                  "/work-hours-details-staff"
                )}`}
              >
                <Link className="sidebar-link" to="/work-hours-details-staff">
                  <FeatherIcon icon="aperture" className="align-middle" />
                  <span className="align-middle">Phiếu công nhân viên</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive(
                  "/work-hours-details-by-tt"
                )}`}
              >
                <Link className="sidebar-link" to="/work-hours-details-by-tt">
                  <FeatherIcon icon="slack" className="align-middle" />
                  <span className="align-middle">Trạng thái phiếu công</span>
                </Link>
              </li>
            </>
          )}
          {/* {isSUPER && (
            <>
              <li
                className={`sidebar-item ${isActive(
                  "/work-hours-details-staff"
                )}`}
              >
                <Link className="sidebar-link" to="/work-hours-details-staff">
                  <FeatherIcon icon="aperture" className="align-middle" />
                  <span className="align-middle">Phiếu công nhân viên</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive(
                  "/work-hours-details-by-tt"
                )}`}
              >
                <Link className="sidebar-link" to="/work-hours-details-by-tt">
                  <FeatherIcon icon="slack" className="align-middle" />
                  <span className="align-middle">Trạng thái phiếu công</span>
                </Link>
              </li>
            </>
          )} */}
          <li className={`sidebar-item ${isActive("/workhour-details")}`}>
            <Link
              className="sidebar-link"
              to="/workhour-details"
              onClick={onToggleSidebar}
            >
              <FeatherIcon icon="dollar-sign" className="align-middle" />
              <span className="align-middle">Phiếu công</span>
            </Link>
          </li>
          <li className="sidebar-header">Lương</li>
          {(isQL || isTT) && (
            <>
              <li
                className={`sidebar-item ${isActive("/salary-details-staff")}`}
              >
                <Link className="sidebar-link" to="/salary-details-staff">
                  <FeatherIcon icon="aperture" className="align-middle" />
                  <span className="align-middle">Phiếu lương nhân viên</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${isActive("/salary-details-by-tt")}`}
              >
                <Link className="sidebar-link" to="/salary-details-by-tt">
                  <FeatherIcon icon="slack" className="align-middle" />
                  <span className="align-middle">Trạng thái phiếu lương</span>
                </Link>
              </li>
            </>
          )}
          <li className={`sidebar-item ${isActive("/user-guide")}`}>
            <Link
              className="sidebar-link"
              to="/user-guide"
              onClick={onToggleSidebar}
            >
              <FeatherIcon icon="file-text" className="align-middle" />
              <span className="align-middle">Hướng dẫn sử dụng</span>
            </Link>
          </li>
          <li className={`sidebar-item ${isActive("/salary-details")}`}>
            <Link
              className="sidebar-link"
              to="/salary-details"
              onClick={onToggleSidebar}
            >
              <FeatherIcon icon="dollar-sign" className="align-middle" />
              <span className="align-middle">Phiếu lương</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Sidebar;
