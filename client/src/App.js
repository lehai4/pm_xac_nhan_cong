import React, { useEffect, useState } from "react";
import "./App.css";
import "./pages/ManagerWorkHours/index.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UploadSalary from "./pages/UploadSalary";
import UserGuide from "./pages/UserGuide";
import Login from "./pages/Login";
import SalaryDetails from "./pages/SalaryDetails.js";
import Setting from "./pages/Setting";
import ForgotPassword from "./pages/ForgotPassword";
import Managesalarys from "./pages/Managesalarys";
import SalaryStaff from "./pages/SalaryStaff";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./hooks/useAuth.js";
import axios from "axios";
import { API_BASE_URL } from "./config/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangePasswordForm from "./pages/ChangePasswordForm";
import SuperSalary from "./pages/AdminSalary";
import SalaryStaffByTT from "./pages/SalaryStaffByTT";
import ManageSuper from "./pages/ManageSuper";
import {
  SuperManagerWorkHours,
  SupperEachWorkHours,
  UploadWorkHours,
} from "./pages";
import WorkHourDetails from "./pages/ManagerWorkHours/WorkHourDetails.js";
import ManagerWorkHoursStatus from "./pages/ManagerWorkHours/ManagerWorkHoursStatus.js";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const token = localStorage.getItem("token");
  const ma_nv = localStorage.getItem("ma_nv");
  const socketid = localStorage.getItem("socketId");
  const [is_login, setIs_login] = useState(null);
  const { isAdmin, isSUPER } = useAuth();
  const [hasFetched, setHasFetched] = useState(false); // Biến trạng thái để theo dõi

  useEffect(() => {
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [token]);

  const Nhanvien = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nhanvien/bymanv/${ma_nv}`
      );
      setIs_login(response.data.is_login);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched && ma_nv) {
        await Nhanvien();
        setHasFetched(true); // Đánh dấu là đã gọi
      }
    };

    fetchData();
  }, [ma_nv, hasFetched]); // Chỉ theo dõi ma_nv và hasFetched

  useEffect(() => {
    // Kiểm tra điều kiện để chuyển hướng
    if (is_login !== null && is_login !== socketid) {
      // Đảm bảo is_login đã được cập nhật
      alert("Bạn đã đăng nhập ở thiết bị khác, bạn sẽ bị đăng xuất");
      localStorage.clear();
      window.location.href = "/login";
    }
  }, [is_login, socketid]); // Theo dõi is_login và socketid

  return (
    <>
      <ToastContainer />
      <Routes>
        {loggedIn ? (
          <Route path="/" element={<Layout />}>
            {/* Routes nested inside Layout */}
            {isAdmin && (
              <>
                <Route index element={<Dashboard />} />
                <Route path="upload-salary" element={<UploadSalary />} />
                <Route path="user-guide" element={<UserGuide />} />
                <Route path="manage-salary" element={<Managesalarys />} />
                <Route path="salary-details" element={<SalaryDetails />} />
                <Route path="workhour-details" element={<WorkHourDetails />} />
                <Route
                  path="salary-details-staff"
                  element={<SalaryStaff ma_nv={ma_nv} />}
                />
                <Route
                  path="salary-details-by-tt"
                  element={<SalaryStaffByTT ma_nv={ma_nv} />}
                />
                <Route path="settings" element={<Setting />} />
                <Route
                  path="change-password"
                  element={<ChangePasswordForm />}
                />
                {/* Quản lý công*/}
                <Route
                  path="manage-workhours-status"
                  element={<ManagerWorkHoursStatus />}
                />
                <Route
                  path="upload-working-hours"
                  element={<UploadWorkHours />}
                />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
            {isSUPER && (
              <>
                <Route path="super-salary" element={<SuperSalary />} />
                <Route path="super-manage" element={<ManageSuper />} />

                {/* Quản lý công */}
                <Route
                  path="super-management-workhours"
                  element={<SuperManagerWorkHours />}
                />
                <Route
                  path="supper-each-workhours"
                  element={<SupperEachWorkHours />}
                />
              </>
            )}
            {!isAdmin && (
              <>
                <Route index element={<UserGuide />} />
                <Route path="salary-details" element={<SalaryDetails />} />
                <Route path="workhour-details" element={<WorkHourDetails />} />
                <Route
                  path="salary-details-staff"
                  element={<SalaryStaff ma_nv={ma_nv} />}
                />
                <Route
                  path="salary-details-by-tt"
                  element={<SalaryStaffByTT ma_nv={ma_nv} />}
                />
                <Route
                  path="change-password"
                  element={<ChangePasswordForm />}
                />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Route>
        ) : (
          <>
            <Route path="login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="login" />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
