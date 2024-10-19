import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import SalaryDetailModal from "../components/Model/SalaryDetailModal";
import { Spin } from "antd";
// import "antd/dist/antd.css"; // hoặc 'antd/dist/antd.less' nếu bạn sử dụng Less

const SalaryStaff = (ma_nv) => {
  const { isQL, isTT } = useAuth();
  const [dotLuong, setDotLuong] = useState([]);
  const [salaries, setSalaries] = useState({});
  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
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

  // Lấy dữ liệu lương
  const fetchSalaries = useCallback(async () => {
    if (!isQL && !isTT) return;
    console.log(dotLuong.length === 0, !id_bo_phan);
    if (dotLuong.length === 0 || !id_bo_phan) return;
    try {
      const salaryPromises = dotLuong.map(async (dot) => {
        const endpoint = isQL ? "search-by-ql-id" : "search-by-tt-id";
        const phutrach = isQL ? ma_nv.ma_nv : id_bo_phan;
        const response = await axios.get(
          `${API_BASE_URL}/salarys/${endpoint}/${dot.bang_luong_t}/${phutrach}`
        );
        return response.data;
      });

      const salaryResults = await Promise.all(salaryPromises);
      const combinedSalaries = Object.assign({}, ...salaryResults);
      setSalaries(combinedSalaries);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setSalaries({});
    }
  }, [isQL, isTT, dotLuong, id_bo_phan]);

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
            `${API_BASE_URL}/dotluong/${search.periodName}`
          );
          loaiPhieuData = loaiPhieuResponse.data;
          setLoaiPhieu(loaiPhieuData);
        }

        const response = await axios.get(
          `${API_BASE_URL}/salarys/${endpoint}/${ma_nv.ma_nv}`,
          { params }
        );

        const { results, pagination } = response.data;
        // Fetch chi tiết cho mỗi nhân viên
        const detailedResults = await Promise.all(
          results.map(async (salary) => {
            let chiTrong = [];
            let chiNgoai = [];
            let salaryStatus = null;
            // Đảm bảo loaiPhieuData tồn tại và có thuộc tính loai_phieu
            const loaiPhieu =
              loaiPhieuData && loaiPhieuData.loai_phieu
                ? parseInt(loaiPhieuData.loai_phieu, 10)
                : null;

            console.log("loaiPhieu after parsing:", loaiPhieu);

            if (loaiPhieu === 1) {
              console.log("Fetching Chi Trong");
              try {
                const chiTrongResponse = await axios.get(
                  `${API_BASE_URL}/chitrong/active-chitrong-ql/${salary.ma_nv}`
                );
                chiTrong = chiTrongResponse.data || [];
                console.log("chiTrong", chiTrong);
              } catch (error) {
                console.error("Lỗi khi lấy dữ liệu Chi Trong:", error);
              }
            } else if (loaiPhieu === 2) {
              console.log("Fetching Chi Ngoai");
              try {
                const chiNgoaiResponse = await axios.get(
                  `${API_BASE_URL}/chingoai/active-chingoai-ql/${salary.ma_nv}`
                );
                chiNgoai = chiNgoaiResponse.data || [];
                console.log("chiNgoai", chiNgoai);
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu Chi Ngoai:", error);
                }
              }
            } else {
              console.log("Invalid or missing loaiPhieu:", loaiPhieu);
            }

            return {
              ...salary,
              chiTrong,
              chiNgoai,
              salaryStatus,
              loaiPhieu,
            };
          })
        );

        setFilteredSalarys(detailedResults);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setFilteredSalarys([]);
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

  const fetchDotLuong = useCallback(async () => {
    if (!search.month) return;

    try {
      const formattedMonth = moment(search.month).format("MM-YYYY");
      const response = await axios.get(
        `${API_BASE_URL}/dotluong/month/${formattedMonth}`
      );
      setDotLuong(response.data);
    } catch (error) {
      console.error("Error fetching salary periods:", error);
      setDotLuong([]);
    }
  }, [search.month]);

  useEffect(() => {
    const loadData = async () => {
      if (dataLoaded) return; // Skip if data is already loaded

      try {
        await fetchNhanVien();
        await fetchDotLuong();
        if (dotLuong.length > 0) {
          await fetchSalaries();
        }
        setDataLoaded(true); // Mark data as loaded
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [fetchNhanVien, fetchDotLuong, fetchSalaries, dotLuong, dataLoaded]);

  // Load ReadTime
  const reloadData = () => {
    setDataLoaded(false); // Reset the dataLoaded state to trigger a reload
  };

  // Xem chi tiết
  const [currentView, setCurrentView] = useState("chi_trong");
  const [filteredSalarys, setFilteredSalarys] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  const handleViewDetails = useCallback(
    async (ma_nv) => {
      try {
        // Fetch Chi Trong data
        let chiTrong = [];
        try {
          const chiTrongResponse = await axios.get(
            `${API_BASE_URL}/chitrong/active-chitrong-ql/${ma_nv}`
          );
          chiTrong = chiTrongResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu Chi Trong");
          } else {
            throw error;
          }
        }

        // Fetch Chi Ngoai data
        let chiNgoai = [];
        try {
          const chiNgoaiResponse = await axios.get(
            `${API_BASE_URL}/chingoai/active-chingoai-ql/${ma_nv}`
          );
          chiNgoai = chiNgoaiResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Không tìm thấy dữ liệu Chi Ngoai");
          } else {
            throw error;
          }
        }

        if (chiTrong.length > 0 || chiNgoai.length > 0) {
          setSelectedEmployee({
            ma_nv,
            chi_trong: chiTrong,
            chi_ngoai: chiNgoai,
          });

          // Mặc định hiển thị Chi Trong nếu có, nếu không thì hiển thị Chi Ngoai
          setCurrentView(chiTrong.length > 0 ? "chi_trong" : "chi_ngoai");
          setShowSalaryModal(true);
        } else {
          // Hiển thị modal không có dữ liệu
          setNoDataMessage("Không tìm thấy thông tin lương cho nhân viên này.");
          setShowNoDataModal(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Có lỗi xảy ra khi lấy thông tin lương. Vui lòng thử lại.");
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
    fetchDotLuong();
    fetchNhanVien(1, true); // Reset về trang 1 và áp dụng bộ lọc mới
  };
  // Hàm định dạng số
  const formatNumber = (number) =>
    new Intl.NumberFormat("en-US").format(number); // Create a reusable function

  return (
    <div className="">
      <button onClick={reloadData}>Reload Data</button>
      <form className="needs-validation mb-4" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="new-month-salary" className="form-label">
                Bảng lương tháng
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
                <option value="">Chọn đợt lương</option>
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
                  {loaiPhieu.loai_phieu === "1" && (
                    <>
                      <th>Tổng lương</th>
                      <th>Lương gián tiếp</th>
                      <th>Lương trực tiếp</th>
                      <th>Làm thêm ngày thường</th>
                      <th>Thưởng KQSX</th>
                      <th>Thưởng CBCNV giỏi</th>
                      <th>Thưởng HTKH ngày</th>
                      <th>Các khoản khác</th>
                    </>
                  )}
                  {loaiPhieu.loai_phieu === "2" && (
                    <>
                      <th>Lương tổng cộng</th>
                      <th>Giờ công giãn ca</th>
                      <th>Giờ công ngày nghỉ</th>
                      <th>Làm thêm ngày thường</th>
                      <th>Làm thêm ngày nghỉ</th>
                      <th>Các khoản khác</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredSalarys &&
                  filteredSalarys.map((salary, index) => (
                    <tr key={salary?.id || index}>
                      <td data-label="Mã NV">{salary?.ma_nv || ""}</td>
                      <td className="text-start" data-label="Họ tên">
                        {salary?.ten_nv || ""}
                      </td>
                      <td data-label="Xem chi tiết">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewDetails(salary.ma_nv)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                      {loaiPhieu.loai_phieu === "1" && (
                        <>
                          {" "}
                          <td data-label="Tổng lương">
                            {formatNumber(
                              (salary.chiTrong[0] &&
                                salary.chiTrong[0].thuc_lanh) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].luong_gian_tiep) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương trực tiếp">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].luong_truc_tiep) ||
                                0
                            )}
                          </td>
                          <td data-label="Làm thêm ngày thường">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0]
                                  .luong_lam_them_ngay_thuong) ||
                                0
                            )}
                          </td>
                          <td data-label="Thưởng KQSX">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].thuong_kpi_san_xuat) ||
                                0
                            )}
                          </td>
                          <td data-label="Thưởng CBCNV giỏi">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].thuong_cb_nv_gioi) ||
                                0
                            )}
                          </td>
                          <td data-label="Thưởng HTKH ngày">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].thuong_hoan_thanh_kh_ngay) ||
                                0
                            )}
                          </td>
                          <td data-label="Các khoản khác">
                            {formatNumber(
                              (salary?.chiTrong[0] &&
                                salary.chiTrong[0].cac_khoan_khac) ||
                                0
                            )}
                          </td>
                        </>
                      )}
                      {loaiPhieu.loai_phieu === "2" && (
                        <>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].tong_cong) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].gio_cong_lam_them_nt) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].gio_cong_lam_them_nn) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].lam_them_nt) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].lam_them_nn) ||
                                0
                            )}
                          </td>
                          <td data-label="Lương gián tiếp">
                            {formatNumber(
                              (salary?.chiNgoai[0] &&
                                salary.chiNgoai[0].cac_khoan_khac) ||
                                0
                            )}
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
      <SalaryDetailModal
        employee={selectedEmployee}
        show={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
    </div>
  );
};

export default SalaryStaff;
