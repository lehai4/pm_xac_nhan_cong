import React from "react";
import moment from "moment";

const SalaryDetailModal = ({
  employee,
  show,
  onClose,
  currentView,
  setCurrentView,
}) => {
  if (!show || !employee) return null;

  const { chi_trong, chi_ngoai } = employee;
  // Hàm định dạng số
  const formatNumber = (number) =>
    new Intl.NumberFormat("en-US").format(number); // Create a reusable function

  const toggleView = () => {
    setCurrentView(currentView === "chi_trong" ? "chi_ngoai" : "chi_trong");
  };

  const salaryData = currentView === "chi_trong" ? chi_trong[0] : chi_ngoai[0];
  console.log(salaryData);

  const showToggleButton =
    chi_trong.length > 0 && chi_ngoai.length > 0 && currentView === "chi_trong";

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-3">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {currentView === "no_data" ? "Thông tin lương" : `Chi tiết lương`}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {!salaryData && (
            <div className="modal-body">
              <div className="alert alert-warning">
                Không tìm thấy thông tin lương cho loại này.
              </div>
            </div>
          )}
          {salaryData && (
            <>
              <div className="modal-body">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                      BẢNG LƯƠNG CÁ NHÂN T{salaryData?.bang_luong_t}
                    </h4>
                    <p className="mb-0">
                      Ngày thanh toán:{" "}
                      {moment(salaryData?.ngay_thanh_toan).format("DD/MM/YYYY")}
                    </p>
                  </div>

                  {currentView === "chi_trong" && (
                    <div className="card-body">
                      <h5>Thông tin cá nhân</h5>
                      <p>
                        <strong>Họ tên:</strong> {salaryData.ho_ten}
                      </p>
                      <p>
                        <strong>Số thẻ:</strong> LH{salaryData.ma_nv}
                      </p>
                      <p>
                        <strong>Đơn vị:</strong> {salaryData.to_in_luong}
                      </p>
                      <p>
                        <strong>Mã số thuế:</strong> {salaryData.ma_so_thue}
                      </p>

                      <h5 className="mt-4">Chi tiết lương</h5>
                      <table className="table table-striped">
                        <tbody>
                          <tr>
                            <td>Mức lương HĐLĐ:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.muc_luong_hd)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ công thực tế:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_thuc_te)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ công TT7/CB/CT:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_T7_CN_CT)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ công giãn ca:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_ngay_thuong)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ công ngày nghỉ:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_nghi)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ công phép + Giờ công thời gian:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_phep_thoi_gian)}
                            </td>
                          </tr>
                          <tr>
                            <td>Giờ huấn luyện:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.gio_cong_huan_luyen)}
                            </td>
                          </tr>
                          <tr>
                            <td>Lương thời gian + lương phép:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.luong_tg_phep)}
                            </td>
                          </tr>
                          <tr>
                            <td>Lương trực tiếp:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.luong_truc_tiep)}
                            </td>
                          </tr>
                          <tr>
                            <td>Lương gián tiếp:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.luong_gian_tiep)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp làm đêm:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.phu_cap_lam_dem)}
                            </td>
                          </tr>
                          <tr>
                            <td>Làm thêm ngày thường:</td>
                            <td className="text-end">
                              {formatNumber(
                                salaryData.luong_lam_them_ngay_thuong
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Làm thêm ngày nghỉ:</td>
                            <td className="text-end">
                              {formatNumber(
                                salaryData.luong_lam_them_ngay_nghi
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Thưởng kết quả sản xuất:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.thuong_kpi_san_xuat)}
                            </td>
                          </tr>
                          <tr>
                            <td>Thưởng CBCNV giỏi:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.thuong_cb_nv_gioi)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp kiêm việc:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.phu_cap_kiem_viec)}
                            </td>
                          </tr>
                          <tr>
                            <td>Trợ cấp con nhỏ:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.phu_cap_con_nho)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp đi lại, xăng xe:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.phu_cap_di_lai_xang_xe)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp tiền ăn:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.phu_cap_tien_an)}
                            </td>
                          </tr>
                          <tr>
                            <td>Thưởng HTKH tháng:</td>
                            <td className="text-end">
                              {formatNumber(
                                salaryData.thuong_hoan_thanh_kh_thang
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Thưởng HTKH ngày:</td>
                            <td className="text-end">
                              {formatNumber(
                                salaryData.thuong_hoan_thanh_kh_ngay
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>BS để tròn số đ/v chi TM:</td>
                            <td className="text-end">
                              {formatNumber(
                                salaryData.bo_sung_tron_so_chi_tien_mat
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Các khoản khác:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.cac_khoan_khac)}
                            </td>
                          </tr>
                          <tr>
                            <td>Lương tổng cộng:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.tong_cong)}
                            </td>
                          </tr>
                          <tr>
                            <td>Thuế thu nhập:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.thue_thu_nhap)}
                            </td>
                          </tr>
                          <tr>
                            <td>Bảo hiểm:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.bao_hiem)}
                            </td>
                          </tr>
                          <tr>
                            <td>Thu hồi phép:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.thu_hoi_phep)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="table-primary">
                            <th>Thực lãnh</th>
                            <th className="text-end">
                              {formatNumber(salaryData.thuc_lanh)}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  {currentView === "chi_ngoai" && (
                    <div className="card-body">
                      <h5>Thông tin cá nhân</h5>
                      <p>
                        <strong>Họ tên:</strong> {salaryData.ho_ten}
                      </p>
                      <p>
                        <strong>Số thẻ:</strong> LH{salaryData.ma_nv}
                      </p>
                      <h5 className="mt-4">Chi tiết lương</h5>
                      <table className="table table-striped">
                        <tbody>
                          <tr>
                            <td>Gcgc:</td>
                            <td className="text-end">
                              {salaryData.gio_cong_lam_them_nt}
                            </td>
                          </tr>
                          <tr>
                            <td>Gcnn</td>
                            <td className="text-end">
                              {salaryData.gio_cong_lam_them_nn}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp làm đêm:</td>
                            <td className="text-end">
                              {salaryData.phu_cap_dem}
                            </td>
                          </tr>
                          <tr>
                            <td>Làm thêm Ng. thường:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.lam_them_nt)}
                            </td>
                          </tr>
                          <tr>
                            <td>Làm thêm Ng. nghỉ:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.lam_them_nn)}
                            </td>
                          </tr>
                          <tr>
                            <td>Thưởng KQSX:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.thuong_ksnx_ngay_thuong)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp đi lại, xăng xe:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.tien_xe)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phụ cấp tiền ăn:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.tien_an)}
                            </td>
                          </tr>
                          <tr>
                            <td>BS để tròn số đ/v chi TM:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.bo_sung_so_cho_tien_mat)}
                            </td>
                          </tr>
                          <tr>
                            <td>Các khoản khác:</td>
                            <td className="text-end">
                              {formatNumber(salaryData.cac_khoan_khac)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="table-primary">
                            <th>Thực lãnh</th>
                            <th className="text-end">
                              {formatNumber(salaryData.tong_cong)}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="modal-footer">
            {showToggleButton && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={toggleView}
              >
                Xem tiếp
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetailModal;
