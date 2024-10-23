import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const SalaryStaffByTT = (ma_nv) => {
  const { isQL, isTT } = useAuth();
  const [salarys, setSalarys] = useState([]);
  const [dotLuong, setDotLuong] = useState([]);
  const [loaiPhieu, setLoaiPhieu] = useState([]);
  const [PhongBanArray, setPhongBanArray] = useState([]);
  const [search, setSearch] = useState({
    month: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    periodName: "",
    employeeId: "",
    status: "Đã xác nhận",
    bophan: "",
  });

  useEffect(() => {
    fetchData();
  }, [
    search.month,
    search.periodName,
    // search.status,
    ma_nv.ma_nv,
    search.phongban,
  ]);

  const fetchData = async () => {
    await DotLuong();
    await LoaiPhieu();
    await fetchNhanVien();

    // Lấy dữ liệu phòng ban
    const fetchPhongBan = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/bophan/bophan-by-phutrach/${ma_nv.ma_nv}`
        );

        setPhongBanArray(response.data);
      } catch (error) {
        setPhongBanArray([]);
      }
    };
    fetchPhongBan();
  };

  const LoaiPhieu = async () => {
    const response = await axios.get(
      `${API_BASE_URL}/dotluong/${search.periodName}`
    );
    setLoaiPhieu(response.data);
  };

  // Hiện modal Câu hỏi
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Lấy dữ liệu đợt lương
  const DotLuong = async () => {
    if (search.month) {
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
    } else {
      setDotLuong([]);
    }
  };

  const fetchNhanVienOLD = useCallback(
    async (page = 1, applyFilters = false) => {
      const endpoint = isQL ? "search-by-ql" : "search-by-tt";
      try {
        const params = {
          page: page,
          limit: 20,
        };

        if (applyFilters) {
          if (search.employeeId.trim() !== "") {
            params.employeeId = search.employeeId.trim();
          }
          if (search.bophan !== "") {
            params.bophan = search.bophan;
          }
        }

        // Gọi API để lấy danh sách nhân viên
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

            // Lấy chi tiết chi trong hoặc chi ngoài dựa trên loại phiếu
            if (loaiPhieu.loai_phieu === "1") {
              try {
                const chiTrongResponse = await axios.get(
                  `${API_BASE_URL}/chitrong/active-chitrong-sp/${salary.ma_nv}`
                );
                chiTrong = chiTrongResponse.data || [];
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu Chi Trong:", error);
                }
              }
            } else if (loaiPhieu.loai_phieu === "2") {
              try {
                const chiNgoaiResponse = await axios.get(
                  `${API_BASE_URL}/chingoai/active-chingoai-sp/${salary.ma_nv}`
                );
                chiNgoai = chiNgoaiResponse.data || [];
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu Chi Ngoai:", error);
                }
              }
            }

            // Kiểm tra nếu không có cả hai phiếu
            const hasSalary = chiTrong.length > 0 || chiNgoai.length > 0;

            return {
              ...salary,
              chiTrong,
              chiNgoai,
              hasSalary, // Thêm thuộc tính để xác định có lương hay không
            };
          })
        );

        // Fetch chi tiết trạng thái cho mỗi nhân viên
        const detaileStatus = await Promise.all(
          detailedResults.map(async (salary) => {
            let statusTrong = [];
            let statusNgoai = [];

            // Lấy thông tin lương CT và CN
            if (loaiPhieu.loai_phieu === "2" && salary.chiNgoai.length > 0) {
              try {
                const salaryCNResponse = await axios.get(
                  `${API_BASE_URL}/salarys/status/${salary.chiNgoai[0]?.id_dot}/${salary.chiNgoai[0]?.id}/ngoai/${search.status}`
                );
                if (search.status !== "Chưa xác nhận") {
                  statusNgoai = salaryCNResponse.data || [];
                } else {
                  statusNgoai = []; // Gán một mảng rỗng nếu status là "Chưa xác nhận"
                }
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu lương CT hoặc CN:", error);
                }
                statusNgoai = []; // Gán một mảng rỗng nếu có lỗi
              }
            } else if (
              loaiPhieu.loai_phieu === "1" &&
              salary.chiTrong.length > 0
            ) {
              try {
                const salaryCTResponse = await axios.get(
                  `${API_BASE_URL}/salarys/status/${salary.chiTrong[0]?.id_dot}/${salary.chiTrong[0]?.id}/trong/${search.status}`
                );
                if (search.status !== "Chưa xác nhận") {
                  statusTrong = salaryCTResponse.data || [];
                } else {
                  statusTrong = []; // Gán một mảng rỗng nếu status là "Chưa xác nhận"
                }
              } catch (error) {
                if (error.response && error.response.status !== 404) {
                  console.error("Lỗi khi lấy dữ liệu lương CT hoặc CN:", error);
                  statusTrong = []; // Gán một mảng rỗng nếu status là "Chưa xác nhận"
                }
                statusTrong = []; // Gán một mảng rỗng nếu status là "Chưa xác nhận"
              }
            }

            return {
              ...salary,
              statusTrong,
              statusNgoai,
            };
          })
        );

        console.log(detailedResults);
        // Cập nhật trạng thái
        setSalarys(detaileStatus);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setSalarys([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    [isQL, ma_nv.ma_nv, search, API_BASE_URL, loaiPhieu, search.status] // Thêm loaiPhieu vào danh sách phụ thuộc
  );

  const fetchNhanVien = useCallback(
    async (page = 1, applyFilters = false) => {
      try {
        const params = {
          page: page,
          limit: 20,
          phuTrach: ma_nv.ma_nv,
          loaiPhieu: loaiPhieu.loai_phieu,
          tinhTrang: search.status,
          idDot: search.periodName,
          bophan: search.bophan,
        };

        if (applyFilters) {
          if (search.employeeId.trim() !== "") {
            params.maNV = search.employeeId.trim();
          }
          if (search.bophan !== "") {
            params.bophan = search.bophan;
          }
        }

        // Gọi API mới để lấy danh sách nhân viên
        const response = await axios.get(
          `${API_BASE_URL}/salarys/salary-status/ttandql`,
          {
            params,
          }
        );
        const { data, pagination } = response.data;

        // Cập nhật trạng thái
        setSalarys(data);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setSalarys([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    [ma_nv.ma_nv, search, API_BASE_URL, loaiPhieu]
  );

  useEffect(() => {
    if (search.periodName) {
      console.log("Fetching data for periodName:", search.periodName); // Kiểm tra khi gọi fetchNhanVien
      fetchNhanVien(1, true);
    }
  }, [search.periodName, fetchNhanVien]);

  const handleSearchChange = useCallback((name, value) => {
    setSearch((prev) => {
      const newSearch = {
        ...prev,
        [name]: value === null ? "" : value,
      };
      return newSearch;
    });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNhanVien(page);
  };

  // Nhập lý do
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState({
    create_time: new Date(),
    ly_do: "",
    nguoi_nhap: "",
  });
  const [currentSalaryId, setCurrentSalaryId] = useState({
    id_trong: null,
    id_ngoai: null,
    id_dot: null,
  }); // ID của nhân viên hiện tại
  const [isSubmitted, setIsSubmitted] = useState(false); // Thay đổi để theo dõi trạng thái gửi cho từng nhân viên

  const handleShow = (id_dot, id_trong, id_ngoai) => {
    console.log(id_dot, id_trong, id_ngoai);
    setCurrentSalaryId({ id_trong, id_ngoai, id_dot }); // Cập nhật ID của nhân viên hiện tại
    setShowModal(true);
  };
  const handleClose = () => (
    setShowModal(false),
    console.log(isSubmitted && !currentSalaryId === salarys.id)
  );

  const handleSubmitLyDo = async () => {
    if (reason.ly_do === "") {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    const statusLuong = {
      id_trong: currentSalaryId.id_trong, // Sử dụng currentSalaryId để xác định ID
      id_ngoai: currentSalaryId.id_ngoai,
      id_dot: currentSalaryId.id_dot, // Cần đảm bảo rằng bạn có id_dot cho nhân viên này
      tinh_trang: "Đã gửi lý do chưa xác nhận", // Sử dụng lý do để xác định trạng thái
      ly_do: reason.ly_do,
      nguoi_nhap: ma_nv.ma_nv,
      create_time: new Date(),
    };

    try {
      // Gửi yêu cầu POST đến API
      await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);

      toast.success("Gửi lý do thành công");

      // Cập nhật lại lý do
      setReason({
        create_time: new Date(),
        ly_do: "",
        nguoi_nhap: "",
      });

      // Đánh dấu là đã gửi cho nhân viên hiện tại
      setIsSubmitted(true);

      // Gọi lại hàm fetchNhanVien để đồng bộ dữ liệu
      await fetchNhanVien(1, true); // Đảm bảo rằng hàm này trả về một Promise
    } catch (error) {
      console.error("Error submitting reason:", error); // Xử lý lỗi nếu có
    }

    // Đóng modal sau khi gửi
    handleClose();
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

  return (
    <div className="tab-pane fade show active" role="tabpanel">
      <div className="container-fluid py-3">
        <h4 className="text-center mb-4 text-primary h2 fw-bold">
          QUẢN LÝ TRẠNG THÁI
        </h4>
        <form className="needs-validation">
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
                  disabled={true}
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

            <div className="col-xl col-lg-4">
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

            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
                <label htmlFor="ma" className="form-label">
                  Trạng thái
                </label>
                <select
                  className="form-select"
                  id="status"
                  value={search.status}
                  onChange={(e) => handleSearchChange("status", e.target.value)}
                  autoComplete="off"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Câu hỏi">Câu hỏi</option>
                  <option value="Đã xác nhận">Đã xác nhận</option>
                  <option value="Chưa xác nhận">Chưa xác nhận</option>
                </select>
              </div>
            </div>
            <div className="col-xl col-lg-4">
              <div className="mb-3 position-relative">
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
        </form>

        {salarys.length > 0 ? (
          <div className="mt-4">
            <h5>Kết quả tìm kiếm {salarys.length} bản ghi</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Bộ phận</th>
                  {search.periodName && (
                    <>
                      <th>Trạng thái</th>
                      <th className="text-center">Lý do không xác nhận</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {salarys.map((salary, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{salary.ma_nv}</td>
                    <td>{salary.ten_nv}</td>
                    <td>{salary.ten_bo_phan}</td>
                    {search.periodName && (
                      <>
                        <td>
                          {salary.l_id
                            ? salary.tinh_trang || "Chưa có trạng thái"
                            : "Không có lương"}
                        </td>
                        <td className="text-center">
                          {salary.tinh_trang ? (
                            salary.tinh_trang ===
                            "Đã gửi lý do chưa xác nhận" ? (
                              <span>{salary.l_ly_do}</span>
                            ) : salary.tinh_trang !== search.status ? (
                              <span>Khác</span>
                            ) : (
                              <span>{salary.tinh_trang}</span>
                            )
                          ) : salary.l_id ? (
                            <button
                              className="btn btn-primary mx-2"
                              onClick={() =>
                                handleShow(salary.id_dot, salary.l_id)
                              }
                            >
                              Nhập lý do
                            </button>
                          ) : (
                            <span>Không có lương</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
            <Modal show={showModal} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Nhập lý do không xác nhận</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="reasonTextarea">
                    <Form.Label>Lý do</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reason.ly_do}
                      onChange={
                        (e) => setReason({ ...reason, ly_do: e.target.value }) // Cập nhật lý do
                      }
                      placeholder="Nhập lý do tại đây..."
                      required
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmitLyDo}>
                  Gửi
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <div className="mt-4">
            {search.status === "Câu hỏi" ? (
              <h5>Không tìm thấy thông tin Câu hỏi</h5>
            ) : search.status === "Đã xác nhận" ? (
              <h5>Không tìm thấy thông tin Đã xác nhận</h5>
            ) : (
              <h5>Không tìm thấy thông tin Chưa xác nhận</h5>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryStaffByTT;
