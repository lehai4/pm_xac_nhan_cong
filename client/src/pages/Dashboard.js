import React, { useEffect, useState } from "react";
import axios from "axios";
import FeatherIcon from "feather-icons-react";
import { API_BASE_URL } from "../config/api";
import DatePicker from "react-datepicker";
import moment from "moment";
import { toast } from "react-toastify";

function Dashboard() {
  const [totalSalary, setTotalSalary] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    doneSalariesCount: 0,
    complaintSalariesCount: 0,
    updateDataSalariesCount: 0,
    noUpdateDataSalariesCount: 0,
  });
  const [dotLuong, setDotLuong] = useState([]);
  const [isDotLuong, setIsDotLuong] = useState([]);

  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    periodName: "",
  });

  const handleSearchChange = (name, value) => {
    setSearch((prev) => ({
      ...prev,
      [name]: value === null ? "" : value,
    }));
  };

  // Lấy dữ liệu đợt lương bằng tháng
  const DotLuong = async () => {
    if (!search.month) return setDotLuong([]); // Early return if no month
    try {
      const formattedMonth = moment(search.month).format("MM-YYYY");
      const response = await axios.get(
        `${API_BASE_URL}/dotluong/month/${formattedMonth}`
      );
      setDotLuong(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
      setDotLuong([]);
    }
  };

  const DotLuongByName = async () => {
    const periodName = search.periodName;
    if (!periodName) return null;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dotluong/${periodName}`
      );
      setIsDotLuong(response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
      setIsDotLuong([]);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (search.periodName) {
        try {
          const [statsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/statusluong/stats/${search.periodName}`),
          ]);

          // setTotalSalary(totalSalaryResponse.data);
          setDashboardStats(statsResponse.data);
          console.log(statsResponse.data);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu dashboard:", error);
          toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        }
      }
    };

    fetchDashboardData();
  }, [search.periodName]);

  // Lấy dữ liệu đợt lương bằng id dot
  const isDotLuongByIdDot = async (dotLuong) => {
    if (!dotLuong?.id || !dotLuong.loai_phieu) return; // Optional chaining for safety
    const endpoint = dotLuong.loai_phieu === "1" ? "chitrong" : "chingoai";
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${endpoint}/id_dot/${dotLuong.id}`
      );
      setTotalSalary(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
      setTotalSalary([]); // Simplified error handling
    }
  };

  // Hàm chính để gọi các hàm fetch data
  const fetchData = async () => {
    await DotLuong(); // Fetch đợt lương theo tháng
    const dotLuong = await DotLuongByName();
    if (dotLuong) {
      await isDotLuongByIdDot(dotLuong);
    }
  };

  // Gọi fetchData trong useEffect
  useEffect(() => {
    fetchData();
  }, [search.month, search.periodName, API_BASE_URL]);

  return (
    <>
      <h1 className="h3 mb-3">
        <strong>Tổng quan</strong>
      </h1>

      <div className="row">
        <div className="col-xl-12 col-xxl-12 d-flex">
          <div className="w-100">
            <div className="row">
              <div className="col-xl col-lg-4">
                <div className="mb-3 position-relative w-100">
                  <label htmlFor="new-month-salary" className="form-label">
                    Bảng lương tháng
                  </label>
                  <DatePicker
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    selected={search.month}
                    onChange={(date) => handleSearchChange("month", date)}
                    className="form-control w-auto"
                    id="new-month-salary"
                    autoComplete="off"
                    showYearDropdown
                    showMonthDropdown
                  />
                </div>
              </div>
              <div className="col-xl col-lg-4">
                <div className="mb-3 position-relative">
                  <label htmlFor="update-period-name" className="form-label">
                    Tên đợt lương
                  </label>
                  <select
                    className="form-select"
                    id="update-period-name"
                    value={search.periodName}
                    onChange={(e) =>
                      handleSearchChange("periodName", e.target.value)
                    }
                    required
                  >
                    <option value>Chọn đợt lương</option>
                    {dotLuong && dotLuong.length > 0 ? (
                      dotLuong.map((dot) => (
                        <option key={dot.id} value={dot.id}>
                          {dot.ten_dot}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Không có đợt lương
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="row-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">
                          Tổng số phiếu lương của tháng
                        </h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="file-text" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">{totalSalary.length}</h1>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Đã xác nhận</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="check" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">
                      {dashboardStats.doneSalariesCount}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Chưa xác nhận</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="x" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">
                      {totalSalary.length - dashboardStats.doneSalariesCount}
                    </h1>
                  </div>
                </div>
              </div>
              <span className="card border-primary "></span>
              <div className="row-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Câu hỏi</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="alert-triangle" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">
                      {dashboardStats.complaintSalariesCount}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Cập nhật dữ liệu</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="alert-octagon" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">
                      {dashboardStats.updateDataSalariesCount}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title">Không cập nhật dữ liệu</h5>
                      </div>
                      <div className="col-auto">
                        <div className="stat text-primary">
                          <FeatherIcon icon="check-circle" />
                        </div>
                      </div>
                    </div>
                    <h1 className="mt-1 mb-3">
                      {dashboardStats.noUpdateDataSalariesCount}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
