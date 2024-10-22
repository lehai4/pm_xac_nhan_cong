import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import SalaryDetailModal from "../../components/Model/SalaryDetailModal";
import { Spin } from "antd";
import WorkingHoursModal from "../../components/Model/WorkingHoursModal";
// import "antd/dist/antd.css"; // hoặc 'antd/dist/antd.less' nếu bạn sử dụng Less

const WorkHoursStaff = (ma_nv) => {
  const { isQL, isTT } = useAuth();
  const [dotCong, setDotCong] = useState([]);
  const [salaries, setCongs] = useState({});
  const [search, setSearch] = useState({
    // month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    month: new Date(new Date().setMonth(new Date().getMonth())),
    employeeId: "",
    bophan: "",
    periodName: "",
  });
  const id_bo_phan = localStorage.getItem("id_bo_phan");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [BoPhanArray, setBoPhanArray] = useState([]);
  const [PhongBanArray, setPhongBanArray] = useState([]);
  const [ten_phong_ban, setTenPhongBan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50; // Số lượng item trên mỗi trang, có thể điều chỉnh
  const [loaiPhieu, setLoaiPhieu] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const salaryPromises = dotCong.map(async (dot) => {
        const endpoint = isQL ? "search-by-ql-id" : "search-by-tt-id";
        const phutrach = isQL ? ma_nv.ma_nv : id_bo_phan;
        const response = await axios.get(
          `${API_BASE_URL}/congs/${endpoint}/${dot.bang_cong_t}/${phutrach}`
        );
        return response.data;
      });

      const salaryResults = await Promise.all(salaryPromises);
      const combinedSalaries = Object.assign({}, ...salaryResults);
      setCongs(combinedSalaries);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setCongs({});
    }
  }, [isQL, isTT, dotCong, id_bo_phan]);

  const fetchNhanVien = useCallback(
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
        }
        console.log("ma_nv", ma_nv);
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
            let mainWork = [];
            let congStatus = null;
            // Đảm bảo loaiPhieuData tồn tại và có thuộc tính loai_phieu
            const loaiPhieu =
              loaiPhieuData && loaiPhieuData.loai_phieu
                ? parseInt(loaiPhieuData.loai_phieu, 10)
                : null;

            console.log("loaiPhieu after parsing:", loaiPhieu);

            if (loaiPhieu === 1) {
              console.log("Fetching HST");
              try {
                const HSTResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-he-so-thuong-ql/${cong.ma_nv}`
                );
                HST = HSTResponse.data || [];
                console.log("HST", HST);
              } catch (error) {
                console.error("Lỗi khi lấy dữ liệu HST:", error);
              }
            } else if (loaiPhieu === 2) {
              console.log("Fetching GCGC");
              try {
                const GCGCResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-gio-cong-gian-ca-ql/${cong.ma_nv}`
                );
                GCGC = GCGCResponse.data || [];
                console.log("GCGC", GCGC);
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu GCGC:", error);
                }
              }
            } else if (loaiPhieu === 3) {
              console.log("Fetching Main");
              try {
                const mainResponse = await axios.get(
                  `${API_BASE_URL}/dotcong/active-gio-cong-main-ql/${cong.ma_nv}`
                );
                mainWork = mainResponse.data || [];
                console.log("mainWork", mainWork);
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
              mainWork,
              congStatus,
              loaiPhieu,
            };
          })
        );

        setFilteredCongs(detailedResults);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setFilteredCongs([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [isQL, ma_nv.ma_nv, itemsPerPage, search, API_BASE_URL, setLoaiPhieu]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNhanVien(page);
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
        await fetchNhanVien();
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
  }, [fetchNhanVien, fetchDotCong, fetchDotCongs, dotCong, dataLoaded]);

  // Load ReadTime
  const reloadData = () => {
    setDataLoaded(false); // Reset the dataLoaded state to trigger a reload
  };

  // Xem chi tiết
  const [currentView, setCurrentView] = useState("cong_main");
  const [filteredCongs, setFilteredCongs] = useState([]);
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

      if (key === "periodName") {
        setIsLoading(true);
        try {
          await fetchNhanVien(1, true);
        } catch (error) {
          console.error("Error fetching data after period change:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchNhanVien]
  );

  useEffect(() => {
    if (search.periodName) {
      fetchNhanVien(1, true);
    }
  }, [search.periodName, fetchNhanVien]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchDotCong();
    // fetchNhanVien(1, true); // Reset về trang 1 và áp dụng bộ lọc mới

    // về nhà viết lại hàm này để khi tìm kiểm là sẽ chỉ hiển thị 1 nhân viên thay vì nhiều nhân viên
  };

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
                disabled
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
                      {bophan.ten_bo_phan}
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
      {dataLoaded && (
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
                </tr>
              </thead>
              <tbody>
                {filteredCongs &&
                  filteredCongs.map((cong, index) => (
                    <tr key={cong?.id || index}>
                      <td data-label="Mã NV">{cong?.ma_nv || ""}</td>
                      <td className="text-start" data-label="Họ tên">
                        {cong?.ten_nv || ""}
                      </td>
                      <td data-label="Xem chi tiết">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewDetails(cong.ma_nv)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
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
