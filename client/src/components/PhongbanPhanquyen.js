import React, { useState, useEffect } from "react";
import { RangeDateTimePicker } from "./DatePickerComponents"; // Giả sử đây là component chọn thời gian
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import moment from "moment";

const PhongbanPhanquyen = ({ onSubmit, activeTab, initialData }) => {
  const [departments, setDepartments] = useState([]); // Trạng thái để lưu dữ liệu phòng ban
  const [fixedTime, setFixedTime] = useState(null); // Trạng thái để lưu thời gian cố định
  const [departmentTimes, setDepartmentTimes] = useState({}); // Trạng thái để lưu thời gian cho từng phòng ban
  const [phanQuyenSalary, setPhanQuyenSalary] = useState([]); //Lấy theo id đợt
  // Hàm lấy dữ liệu phòng ban
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/phanquyen/phongban/phan-quyen-salary`
      ); // Điều chỉnh endpoint nếu cần
      console.log(response.data);
      setDepartments(response.data); // Cập nhật trạng thái với dữ liệu nhận được
    } catch (error) {
      console.error("Error fetching departments:", error); // Xử lý lỗi
    }
  };

  useEffect(() => {
    fetchDepartments(); // Gọi hàm lấy dữ liệu khi component được mount
  }, []);

  useEffect(() => {
    handlePhanQuyenSalary();
  }, [initialData]);

  // Sắp xếp phòng ban theo tên
  const sortedDepartments = departments.sort((a, b) =>
    b.ten_phong_ban.localeCompare(a.ten_phong_ban)
  );

  // Hàm xử lý thay đổi thời gian cho phòng ban
  const handleDepartmentTimeChange = (departmentId, time) => {
    const [startDate, endDate] = time;
    setDepartmentTimes((prev) => ({
      ...prev,
      [departmentId]: {
        time_start: startDate ? formatDate(startDate) : undefined,
        time_end: endDate ? formatDate(endDate) : undefined,
      },
    }));
  };
  // Gọi hàm onSubmit khi cần
  useEffect(() => {
    const validDepartments = sortedDepartments
      .map((department) => {
        const departmentTime = departmentTimes[department.id];
        const phanQuyenTime = phanQuyenSalary.find(
          (item) => item.id_phong_ban === department.id
        );

        return {
          id_phong_ban: department.id,
          time_start:
            departmentTime?.time_start ||
            phanQuyenTime?.time_start ||
            fixedTime?.[0],
          time_end:
            departmentTime?.time_end ||
            phanQuyenTime?.time_end ||
            fixedTime?.[1],
        };
      })
      .filter((dept) => dept.time_start && dept.time_end);
    onSubmit(validDepartments);
  }, [departmentTimes, fixedTime, sortedDepartments, phanQuyenSalary]);

  const getDateTimeValue = (date) => {
    return date instanceof Date && !isNaN(date) ? date : null;
  };

  const handlePhanQuyenSalary = async () => {
    const response = await axios.get(
      `${API_BASE_URL}/phanquyen/phongban/phan-quyen-salary/${initialData}`
    );
    setPhanQuyenSalary(response.data);
  };

  const formatDate = (date) => {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  };

  useEffect(() => {
    if (phanQuyenSalary.length > 0) {
      const initialTimes = {};
      phanQuyenSalary.forEach((item) => {
        const time_start = item.time_start
          ? new Date(formatDate(item.time_start))
          : null;
        const time_end = item.time_end
          ? new Date(formatDate(item.time_end))
          : null;
        if (
          time_start &&
          time_end &&
          !isNaN(time_start.getTime()) &&
          !isNaN(time_end.getTime())
        ) {
          initialTimes[item.id_phong_ban] = {
            time_start,
            time_end,
          };
        }
      });
      setDepartmentTimes(initialTimes);
    }
  }, [phanQuyenSalary, initialData]);

  return (
    <>
      <h4>Chọn phòng ban xem lương</h4>
      <div className="row">
        <div className="col-sm-6 col-lg-4">
          <label htmlFor="fixed-time" className="form-label">
            Thời gian cố định
          </label>
          <RangeDateTimePicker
            onChange={(time) => {
              console.log("Fixed time updated:", time); // Để debug
              setFixedTime(time);
            }}
          />
        </div>
      </div>
      <div className="row">
        <div className="mb-3 position-relative">
          <label htmlFor="department-checkbox" className="form-label">
            Phòng ban
          </label>
          <div className="scrollable-box">
            <div className="row">
              {sortedDepartments.map((department) => (
                <div
                  key={department.id}
                  className="col-sm-6 col-lg-8 d-flex align-items-center mb-3 justify-content-between"
                >
                  <label
                    className="form-label me-2"
                    htmlFor={`department-${department.id}`}
                  >
                    {department.ten_phong_ban} {/* Hiển thị tên phòng ban */}
                  </label>
                  {activeTab === "new" ? (
                    <RangeDateTimePicker
                      startDate={
                        departmentTimes[department.id]?.time_start ||
                        fixedTime?.[0]
                      } // Sử dụng thời gian cố định hoặc thời gian riêng cho phòng ban
                      endDate={
                        departmentTimes[department.id]?.time_end ||
                        fixedTime?.[1]
                      } // Sử dụng thời gian cố định hoặc thời gian riêng cho phòng ban
                      onChange={(time) =>
                        handleDepartmentTimeChange(department.id, time)
                      } // Cập nhật thời gian cho phòng ban
                    />
                  ) : (
                    <RangeDateTimePicker
                      startDate={getDateTimeValue(
                        departmentTimes[department.id]?.time_start ||
                          phanQuyenSalary.find(
                            (item) => item.id_phong_ban === department.id
                          )?.time_start
                      )}
                      endDate={getDateTimeValue(
                        departmentTimes[department.id]?.time_end ||
                          phanQuyenSalary.find(
                            (item) => item.id_phong_ban === department.id
                          )?.time_end
                      )}
                      onChange={(time) => {
                        handleDepartmentTimeChange(department.id, time);
                        console.log(
                          `Updated times for ${department.ten_phong_ban}:`,
                          time
                        );
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhongbanPhanquyen;
