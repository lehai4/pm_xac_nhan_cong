import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const SalaryComplaintModal = ({ loaiPhieu, show, handleClose, salaryData }) => {
  if (!salaryData) {
    return null; // Hoặc có thể return một loading spinner
  }
  const formatNumber = (number) =>
    new Intl.NumberFormat("en-US").format(number); // Create a reusable function
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết lương và Câu hỏi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Thông tin nhân viên</h5>
        <p>Mã NV: {salaryData.ma_nv}</p>
        <p>Họ tên: {salaryData.ho_ten}</p>
        <p>Bộ phận: {salaryData.ten_bo_phan}</p>

        <h5 className="mt-4">Chi tiết lương</h5>
        {loaiPhieu === "1" ? (
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td>Mức lương hợp đồng lao động:</td>
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
                  {formatNumber(salaryData.luong_lam_them_ngay_thuong)}
                </td>
              </tr>
              <tr>
                <td>Làm thêm ngày nghỉ:</td>
                <td className="text-end">
                  {formatNumber(salaryData.luong_lam_them_ngay_nghi)}
                </td>
              </tr>
              <tr>
                <td>Thưởng kết quả sản xuất:</td>
                <td className="text-end">
                  {formatNumber(salaryData.thuong_kpi_san_xuat)}
                </td>
              </tr>
              <tr>
                <td>Thưởng cán bộ công nhân viên giỏi:</td>
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
                <td>Phục cấp đi lại, xăng xe:</td>
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
                <td>Thưởng hoàn thành kết hoạch tháng:</td>
                <td className="text-end">
                  {formatNumber(salaryData.thuong_hoan_thanh_kh_thang)}
                </td>
              </tr>
              <tr>
                <td>Thưởng hoàn thành kết hoạch ngày:</td>
                <td className="text-end">
                  {formatNumber(salaryData.thuong_hoan_thanh_kh_ngay)}
                </td>
              </tr>
              <tr>
                <td>Bổ sung để tròn số đơn vị chi Tiền mặt:</td>
                <td className="text-end">
                  {formatNumber(salaryData.bo_sung_tron_so_chi_tien_mat)}
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
        ) : (
          <table className="table table-striped">
            <tbody>
              <tr>
                <td>Gcgc:</td>
                <td className="text-end">
                  {formatNumber(salaryData.gio_cong_lam_them_nt)}
                </td>
              </tr>
              <tr>
                <td>Gcnn</td>
                <td className="text-end">
                  {formatNumber(salaryData.gio_cong_lam_them_nn)}
                </td>
              </tr>
              <tr>
                <td>Phụ cấp làm đêm:</td>
                <td className="text-end">
                  {formatNumber(salaryData.phu_cap_dem)}
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
                <td className="text-end">{formatNumber(salaryData.tien_xe)}</td>
              </tr>
              <tr>
                <td>Phụ cấp tiền ăn:</td>
                <td className="text-end">{formatNumber(salaryData.tien_an)}</td>
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
        )}
        <h5 className="mt-4">Nội dung Câu hỏi</h5>
        <p>{salaryData.noi_dung_kn || "Không có nội dung Câu hỏi"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SalaryComplaintModal;
