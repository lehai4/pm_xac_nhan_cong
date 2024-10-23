import { Spin } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import WorkingHoursModal from "../../components/Model/WorkingHoursModal";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";
import { formatNumber, getDaysInMonth, getDaysInMonthArr } from "../../utils";

const WorkHoursStaff = (ma_nv) => {
  const { isQL, isTT } = useAuth();
  const [dateInput, setDateInput] = useState("");
  const [dotCong, setDotCong] = useState([]);
  const [currentView, setCurrentView] = useState("cong_main");
  const [employees, setEmployees] = useState([]);
  const [employeesDefault, setEmployeesDefault] = useState([]);
  const [congs, setCongs] = useState({});
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth())),
    employeeId: "",
    bophan: "",
    periodName: "",
  });
  const id_bo_phan = localStorage.getItem("id_bo_phan");
  const [filteredCongs, setFilteredCongs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [BoPhanArray, setBoPhanArray] = useState([]);
  const [PhongBanArray, setPhongBanArray] = useState([]);
  const [ten_phong_ban, setTenPhongBan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 50; // Số lượng item trên mỗi trang, có thể điều chỉnh
  const [loaiPhieu, setLoaiPhieu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu bộ phận
    const fetchBoPhan = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/bophan/${id_bo_phan}`
        );
        setBoPhanArray(response.data);
      } catch (error) {
        console.error("Error fetching department data:", error);
      }
    };
    if (isQL) {
      // Lấy dữ liệu phòng ban
      const fetchPhongBan = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/phongban/phongban-by-phutrach/${ma_nv.ma_nv}`
          );
          setPhongBanArray(response.data);
          setTenPhongBan(response.data[0].ten_phong_ban);
        } catch (error) {
          setPhongBanArray([]);
          setTenPhongBan("");
          console.error("Error fetching department data:", error);
        }
      };
      fetchPhongBan();
    }
    fetchBoPhan();
  }, [id_bo_phan, isQL, isTT, ma_nv.ma_nv]);

  // Lấy dữ liệu công
  const fetchDotCongs = useCallback(async () => {
    if (!isQL && !isTT) return;
    console.log(dotCong.length === 0, !id_bo_phan);
    if (dotCong.length === 0 || !id_bo_phan) return;
    try {
      const congPromises = dotCong.map(async (dot) => {
        const endpoint = isQL ? "search-by-ql-id" : "search-by-tt-id";
        const phutrach = isQL ? ma_nv.ma_nv : id_bo_phan;
        const response = await axios.get(
          `${API_BASE_URL}/congs/${endpoint}/${dot.bang_cong_t}/${phutrach}`
        );
        return response.data;
      });

      const congResults = await Promise.all(congPromises);
      const combinedCongs = Object.assign({}, ...congResults);
      setCongs(combinedCongs);
    } catch (error) {
      console.error("Error fetching công:", error);
      setCongs({});
    }
  }, [isQL, isTT, dotCong, id_bo_phan]);

  const fetchNhanVienFilter = useCallback(
    async (page = 1, applyFilters = false) => {
      const endpoint = isQL ? "search-by-ql" : "search-by-tt";
      try {
        setIsLoading(true);
        const params = {
          page: page,
          limit: itemsPerPage,
        };

        if (applyFilters) {
          if (search.employeeId.trim() !== "") {
            params.employeeId = search.employeeId.trim();
          }
          if (search.bophan !== "") {
            params.bophan = search.bophan;
          }
        }

        // Fetch loại phiếu
        let loaiPhieuData = null;
        console.log(search.periodName);
        if (search.periodName) {
          const loaiPhieuResponse = await axios.get(
            `${API_BASE_URL}/dotcong/${search.periodName}`
          );
          loaiPhieuData = loaiPhieuResponse.data;
          setLoaiPhieu(loaiPhieuData);
          setDateInput(loaiPhieuResponse.data.bang_cong_t);
        }
        const response = await axios.get(
          `${API_BASE_URL}/congs/${endpoint}/${ma_nv.ma_nv}`,
          { params }
        );

        const { results, pagination } = response.data;
        // Fetch chi tiết cho mỗi nhân viên
        const detailedResults = await Promise.all(
          results.map(async (cong) => {
            let HST = [];
            let GCGC = [];
            let cong_main = [];
            let congStatus = null;
            // Đảm bảo loaiPhieuData tồn tại và có thuộc tính loai_phieu
            const loaiPhieu =
              loaiPhieuData && loaiPhieuData.loai_phieu
                ? parseInt(loaiPhieuData.loai_phieu, 10)
                : null;

            if (loaiPhieu === 1) {
              try {
                const HSTResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-he-so-thuong-ql/${cong.ma_nv}`
                );
                HST = HSTResponse.data || [];
              } catch (error) {
                console.error("Lỗi khi lấy dữ liệu HST:", error);
              }
            } else if (loaiPhieu === 2) {
              try {
                const GCGCResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-gio-cong-gian-ca-ql/${cong.ma_nv}`
                );
                GCGC = GCGCResponse.data || [];
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu GCGC:", error);
                }
              }
            } else if (loaiPhieu === 3) {
              try {
                const mainResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-gio-cong-main-ql/${cong.ma_nv}`
                );
                cong_main = mainResponse.data || [];
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu Chi Ngoai:", error);
                }
              }
            } else {
              console.log("Invalid or missing loaiPhieu:", loaiPhieu);
            }

            return {
              ...cong,
              HST,
              GCGC,
              cong_main,
              congStatus,
              loaiPhieu,
            };
          })
        );

        setFilteredCongs(detailedResults);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setFilteredCongs([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    }
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNhanVienFilter(page);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const ellipsis = (
      <li key="ellipsis" className="page-item disabled">
        <span className="page-link">...</span>
      </li>
    );

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(ellipsis);
      pageNumbers.push(totalPages);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
          </li>
          {pageNumbers.map((number, index) =>
            typeof number === "number" ? (
              <li
                key={index}
                className={`page-item ${
                  currentPage === number ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              </li>
            ) : (
              number
            )
          )}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const fetchDotCong = useCallback(async () => {
    if (!search.month) return;

    try {
      const formattedMonth = moment(search.month).format("MM-YYYY");
      const response = await axios.get(
        `${API_BASE_URL}/dotcong/month/${formattedMonth}`
      );
      setDotCong(response.data);
    } catch (error) {
      console.error("Error fetching workhours periods:", error);
      setDotCong([]);
    }
  }, [search.month]);

  useEffect(() => {
    const loadData = async () => {
      if (dataLoaded) return; // Skip if data is already loaded

      try {
        await fetchNhanVienFilter();
        await fetchDotCong();
        if (dotCong.length > 0) {
          await fetchDotCongs();
        }
        setDataLoaded(true); // Mark data as loaded
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [fetchNhanVienFilter, fetchDotCong, fetchDotCongs, dotCong, dataLoaded]);

  // Load ReadTime
  const reloadData = () => {
    setSearch({
      month: new Date(new Date().setMonth(new Date().getMonth())),
      employeeId: "",
      bophan: "",
      periodName: "",
    });
    setDataLoaded(false); // Reset the dataLoaded state to trigger a reload
  };

  // Xem chi tiết
  const [showMainWorkModal, setShowMainWorkModal] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  const handleViewDetails = useCallback(
    async (ma_nv) => {
      try {
        // Fetch Chi Trong data
        let HST = [];
        try {
          const HSTResponse = await axios.get(
            `${API_BASE_URL}/dotcong/active-he-so-thuong-ql/${ma_nv}`
          );
          HST = HSTResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu HST");
          } else {
            throw error;
          }
        }

        // Fetch Chi Ngoai data
        let GCGC = [];
        try {
          const GCGCResponse = await axios.get(
            `${API_BASE_URL}/dotcong/active-gio-cong-gian-ca-ql/${ma_nv}`
          );
          GCGC = GCGCResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu GCGC");
          } else {
            throw error;
          }
        }

        let Main = [];
        try {
          const MainResponse = await axios.get(
            `${API_BASE_URL}/dotcong/active-gio-cong-main-ql/${ma_nv}`
          );
          Main = MainResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu Công chính");
          } else {
            throw error;
          }
        }

        if (Main.length > 0 || HST.length > 0 || GCGC.length > 0) {
          setSelectedEmployee({
            ma_nv,
            he_so_thuong: HST,
            gio_cong_gian_ca: GCGC,
            cong_main: Main,
          });

          setShowMainWorkModal(true);
        } else {
          // Hiển thị modal không có dữ liệu
          setNoDataMessage("Không tìm thấy thông tin công cho nhân viên này.");
          setShowNoDataModal(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Có lỗi xảy ra khi lấy thông tin công. Vui lòng thử lại.");
      }
    },
    [API_BASE_URL]
  );

  const handleSearchChange = useCallback(
    async (key, value) => {
      setSearch((prev) => ({ ...prev, [key]: value }));
    },
    [fetchNhanVienFilter]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchDotCong();
    fetchNhanVienFilter(1, true); // Reset về trang 1 và áp dụng bộ lọc mới
  };

  const rollback = () => {
    setError(null);
    setEmployees(employeesDefault);
  };

  useEffect(() => {
    // Fetch loại phiếu
    const getLoaiPhieu = async () => {
      // Fetch
      let loaiPhieuData = null;
      if (search.periodName) {
        const loaiPhieuResponse = await axios.get(
          `${API_BASE_URL}/dotcong/${search.periodName}`
        );
        loaiPhieuData = loaiPhieuResponse.data;
        setLoaiPhieu(loaiPhieuData);
        setDateInput(loaiPhieuResponse.data.bang_cong_t);
      }
    };
    if (search.periodName) {
      getLoaiPhieu();
    }
  }, [search.periodName]);

  useEffect(() => {
    fetchDotCong();
  }, [search.month]);

  useEffect(() => {
    const dayToday = getDaysInMonthArr(dateInput);
    setDays(dayToday);
  }, [dateInput]);

  if (isLoading) {
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <>
        <div className="text-center mt-5 text-danger">{error}</div>
        <div className="text-center mt-4">
          <button onClick={rollback}>Quay lại</button>
        </div>
      </>
    );
  }
  return (
    <div className="">
      <button onClick={reloadData}>Reload Data</button>
      <form className="needs-validation mb-4" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="new-month-salary" className="form-label">
                Bảng công tháng
              </label>
              <DatePicker
                // disabled
                dateFormat="MM/yyyy"
                showMonthYearPicker
                selected={search.month}
                onChange={(date) => handleSearchChange("month", date)}
                className="form-control"
                id="new-month-salary"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-xl col-lg-4">
            <div className="mb-3 position-relative">
              <label htmlFor="update-period-name" className="form-label">
                Tên đợt công
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
                <option value="">Chọn đợt công</option>
                {dotCong && dotCong.length > 0 ? (
                  dotCong.map((dot) => (
                    <option key={dot.id} value={dot.id}>
                      {dot.ten_dot}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Không có đợt công
                  </option>
                )}
              </select>
            </div>
          </div>
          {isQL && (
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="bophan" className="form-label">
                  Bộ phận
                </label>
                <select
                  className="form-select"
                  id="bophan"
                  value={search.bophan}
                  onChange={(e) => handleSearchChange("bophan", e.target.value)}
                  autoComplete="off"
                >
                  <option value="">CHỌN BỘ PHẬN</option>
                  {PhongBanArray.sort((a, b) =>
                    a.ten_bo_phan.localeCompare(b.ten_bo_phan)
                  ).map((bophan) => (
                    <option key={bophan.id} value={bophan.id}>
                      {bophan.ten_phong_ban}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="ma" className="form-label">
                Mã nhân viên
              </label>
              <input
                type="text"
                className="form-control"
                id="ma"
                placeholder="Nhập mã nhân viên"
                value={search.employeeId}
                onChange={(e) =>
                  handleSearchChange("employeeId", e.target.value)
                }
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>
          </div>
        </div>
      </form>

      {!dataLoaded && <Spin size="large" />}
      {dataLoaded && filteredCongs.length > 0 && dotCong.length > 0 ? (
        <div>
          <h2>
            Danh sách nhân viên {isQL ? ten_phong_ban : BoPhanArray.ten_bo_phan}
          </h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered responsiveTables">
              <thead className="thead-dark">
                <tr className="text-start align-top">
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Xem chi tiết</th>
                  {loaiPhieu.loai_phieu === "1" && (
                    <>
                      {days.map((day) => (
                        <th
                          className="white-space border text-center px-4 py-2"
                          key={day}
                        >
                          Ngày {day}
                        </th>
                      ))}
                      <th className="white-space border text-center px-4 py-2">
                        Vpcl
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Vpkl
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        O
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Hsbq
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Hsbq Thg
                      </th>
                    </>
                  )}
                  {loaiPhieu.loai_phieu === "2" && (
                    <>
                      <th className="white-space border text-center px-4 py-2">
                        Hành chính + Ca1 + Ca2
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ca3
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày thường
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày nghỉ hàng tuần
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày lễ
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Phép
                      </th>
                    </>
                  )}
                  {loaiPhieu.loai_phieu === "3" && (
                    <>
                      <th className="white-space border text-center px-4 py-2">
                        Hành chính + Ca1 + Ca2
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ca3
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày thường
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày nghỉ hàng tuần
                      </th>
                      <th className="white-space border text-center px-4 py-2">
                        Ngày lễ
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công thai thứ 7
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công nuôi con nhỏ
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công người cao tuổi
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công công tác
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Phép(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Ốm(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Con ốm(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Việc riêng có lương(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Việc riêng không lương(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Không lý do(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Việc riêng không lương(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Khám thai(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Thai sản(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Dưỡng sức(giờ)
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Trong giờ
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Ngoài giờ
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công ngừng việc
                      </th>

                      <th className="white-space border text-center px-4 py-2">
                        Giờ công nghỉ lễ
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCongs &&
                  filteredCongs.map((employee, index) => (
                    <tr key={employee?.id || index}>
                      <td data-label="Mã NV">{employee?.ma_nv || ""}</td>
                      <td
                        className="text-start white-space"
                        data-label="Họ tên"
                      >
                        {employee?.ten_nv || ""}
                      </td>
                      <td data-label="Xem chi tiết">
                        <button
                          className="btn btn-primary btn-sm white-space"
                          onClick={() => handleViewDetails(employee.ma_nv)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                      {loaiPhieu.loai_phieu === "1" && (
                        <>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot1
                              ? formatNumber(employee?.HST[0]?.cot1)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot2
                              ? formatNumber(employee?.HST[0]?.cot2)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot3
                              ? formatNumber(employee?.HST[0]?.cot3)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot4
                              ? formatNumber(employee?.HST[0]?.cot4)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot5
                              ? formatNumber(employee?.HST[0]?.cot5)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot6
                              ? formatNumber(employee?.HST[0]?.cot6)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot7
                              ? formatNumber(employee?.HST[0]?.cot7)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot8
                              ? formatNumber(employee?.HST[0]?.cot8)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot9
                              ? formatNumber(employee?.HST[0]?.cot9)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot10
                              ? formatNumber(employee?.HST[0]?.cot10)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot11
                              ? formatNumber(employee?.HST[0]?.cot11)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot12
                              ? formatNumber(employee?.HST[0]?.cot12)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot13
                              ? formatNumber(employee?.HST[0]?.cot13)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot14
                              ? formatNumber(employee?.HST[0]?.cot14)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot15
                              ? formatNumber(employee?.HST[0]?.cot15)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot16
                              ? formatNumber(employee?.HST[0]?.cot16)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot17
                              ? formatNumber(employee?.HST[0]?.cot17)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot18
                              ? formatNumber(employee?.HST[0]?.cot18)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot19
                              ? formatNumber(employee?.HST[0]?.cot19)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot20
                              ? formatNumber(employee?.HST[0]?.cot20)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot21
                              ? formatNumber(employee?.HST[0]?.cot21)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot22
                              ? formatNumber(employee?.HST[0]?.cot22)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot23
                              ? formatNumber(employee?.HST[0]?.cot23)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot24
                              ? formatNumber(employee?.HST[0]?.cot24)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot25
                              ? formatNumber(employee?.HST[0]?.cot25)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot26
                              ? formatNumber(employee?.HST[0]?.cot26)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot27
                              ? formatNumber(employee?.HST[0]?.cot27)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot28
                              ? formatNumber(employee?.HST[0]?.cot28)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot29
                              ? formatNumber(employee?.HST[0]?.cot29)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot30
                              ? formatNumber(employee?.HST[0]?.cot30)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.cot31
                              ? formatNumber(employee?.HST[0]?.cot31)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.vpcl
                              ? formatNumber(employee?.HST[0]?.vpcl)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.vpkl
                              ? formatNumber(employee?.HST[0]?.vpkl)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.o
                              ? formatNumber(employee?.HST[0]?.o)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.hsbq
                              ? formatNumber(employee?.HST[0]?.hsbq)
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.HST[0]?.hsbqthg
                              ? formatNumber(employee?.HST[0]?.hsbqthg)
                              : 0}
                          </td>
                        </>
                      )}
                      {loaiPhieu.loai_phieu === "2" && (
                        <>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.hanh_Chinh_Ca
                              ? formatNumber(employee?.GCGC[0]?.hanh_Chinh_Ca)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.ca3
                              ? formatNumber(employee?.GCGC[0]?.ca3)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.ngay_Thuong
                              ? formatNumber(employee?.GCGC[0]?.ngay_Thuong)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.ngay_Nghi_Hang_Tuan
                              ? formatNumber(
                                  employee?.GCGC[0]?.ngay_Nghi_Hang_Tuan
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.ngay_Le
                              ? formatNumber(employee?.GCGC[0]?.ngay_Le)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.GCGC[0]?.phep
                              ? formatNumber(employee?.GCGC[0]?.phep)
                              : 0}
                          </td>
                        </>
                      )}
                      {loaiPhieu.loai_phieu === "3" && (
                        <>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.hanh_chinh_ca1_ca2
                                )
                              : 0}
                          </td>
                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.ca3)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.ngay_thuong
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.ngay_nghi_hang_tuan
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.ngay_le)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.gc_thai_thu_7
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.gc_nuoi_con_nho
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.gc_nguoi_cao_tuoi
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.gc_cong_tac
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.phep)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.om)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.con_om)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.viec_rieng_co_luong
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.viec_rieng_khong_luong
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.khong_ly_do
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.viec_rieng_khong_luong
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.kham_thai)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.thai_san)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.duong_suc)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.trong_gio)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.ngoai_gio)
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(
                                  employee?.cong_main[0]?.gc_ngung_viec
                                )
                              : 0}
                          </td>

                          <td className="white-space border text-center px-4 py-2">
                            {employee?.cong_main[0]
                              ? formatNumber(employee?.cong_main[0]?.gc_nghi_le)
                              : 0}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      ) : (
        <p>Không có dữ liệu công nhân viên.</p>
      )}
      {showNoDataModal && (
        <div
          className="modal"
          tabIndex="-1"
          role="dialog"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thông báo</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNoDataModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">{noDataMessage}</div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNoDataModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMainWorkModal && (
        <WorkingHoursModal
          employee={selectedEmployee}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onClose={() => setShowMainWorkModal(false)}
        />
      )}
    </div>
  );
};

export default WorkHoursStaff;
