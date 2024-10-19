import { useState } from "react";
import { getDaysInMonth, formatNumber } from "../../utils";
const WorkingHoursModal = (props) => {
  const { onClose, employee, currentView, setCurrentView } = props;

  const { he_so_thuong, gio_cong_gian_ca, cong_main } = employee;

  const [dateInput] = useState(
    cong_main[0].bang_cong_t ||
      he_so_thuong[0].bang_cong_t ||
      gio_cong_gian_ca[0].bang_cong_t
  ); // Chuỗi chứa tháng và năm

  const days = Array.from(
    { length: getDaysInMonth(dateInput) },
    (_, i) => i + 1
  );
  // console.log("congmain", cong_main);
  // console.log("he_so_thuong", he_so_thuong);
  // console.log("gio_cong_gian_ca", gio_cong_gian_ca);
  const renderContent = () => {
    switch (currentView) {
      case "cong_main":
        return (
          <>
            {!cong_main[0] ? (
              <div className="alert alert-warning">
                Không tìm thấy thông tin công cho loại này.
              </div>
            ) : (
              <div className="modal-body">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">T{cong_main[0]?.bang_cong_t}</h4>
                  </div>
                  <div className="card-body">
                    <h5 className="mb-3">Thông tin cá nhân</h5>
                    <p>
                      <strong>Họ tên: </strong>
                      {`${cong_main[0].ho} ${cong_main[0].ten}`}
                    </p>
                    <p>
                      <strong>Số thẻ:</strong> LH{cong_main[0].so_the}
                    </p>
                    <h5 className="mt-4">Chi tiết công</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              rowSpan="2"
                            >
                              Số thẻ
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              rowSpan="2"
                            >
                              Họ
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              rowSpan="2"
                            >
                              Tên
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="2"
                            >
                              GIỜ CÔNG TRONG GIỜ
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="3"
                            >
                              GIỜ CÔNG LÀM THÊM
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="4"
                            ></th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="9"
                            >
                              GIỜ CÔNG VẮNG
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="2"
                            >
                              GIỜ HUẤN LUYỆN
                            </th>
                            <th
                              className="border border-gray-300 px-4 py-2 white-space text-center"
                              colSpan="2"
                            ></th>
                          </tr>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Hành chính + Ca1 + Ca2
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ca3
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ngày thường
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ngày nghỉ hàng tuần
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ngày lễ
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công thai thứ 7
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công nuôi con nhỏ
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công người cao tuổi
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công công tác
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Phép(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ốm(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Con ốm(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Việc riêng có lương(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Việc riêng không lương(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Không lý do(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Khám thai(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Thai sản(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Dưỡng sức(giờ)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Trong giờ
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Ngoài giờ
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công ngừng việc
                            </th>
                            <th className="border border-gray-300 px-4 py-2 white-space text-center">
                              Giờ công nghỉ lễ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {cong_main[0].so_the}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {cong_main[0].ho}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {cong_main[0].ten}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].hanh_chinh_ca1_ca2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].ca3)}
                            </td>

                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].ngay_thuong)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].ngay_nghi_hang_tuan)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].ngay_le)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_thai_thu_7)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_nuoi_con_nho)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_nguoi_cao_tuoi)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_cong_tac)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].phep)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].om)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].con_om)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].viec_rieng_co_luong)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(
                                cong_main[0].viec_rieng_khong_luong
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].khong_ly_do)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].kham_thai)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].thai_san)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].duong_suc)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].trong_gio)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].ngoai_gio)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_ngung_viec)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 white-space text-center">
                              {formatNumber(cong_main[0].gc_nghi_le)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "he_so_thuong":
        return (
          <>
            {!he_so_thuong[0] ? (
              <div className="alert alert-warning">
                Không tìm thấy thông tin công cho loại này.
              </div>
            ) : (
              <div className="modal-body">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">T{he_so_thuong[0]?.bang_cong_t}</h4>
                  </div>
                  <div className="card-body">
                    <h5 className="mb-3">Thông tin cá nhân</h5>
                    <p>
                      <strong>Họ tên: </strong>
                      {`${he_so_thuong[0].ho} ${he_so_thuong[0].ten}`}
                    </p>
                    <p>
                      <strong>Số thẻ:</strong> LH{he_so_thuong[0].so_the}
                    </p>
                    <h5 className="mt-4">Chi tiết công</h5>
                    {/* dạng ngang */}
                    <div className="overflow-x-scroll">
                      <table className="border">
                        <thead>
                          <tr>
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
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot1)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot2)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot3)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot4)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot5)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot6)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot7)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot8)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot9)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot10)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot11)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot12)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot13)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot14)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot15)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot16)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot17)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot18)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot19)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot20)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot21)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot22)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot23)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot24)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot25)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot26)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot27)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot28)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot29)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot30)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].cot31)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].vpcl)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].vpkl)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].o)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].hsbq)}
                            </td>
                            <td className="white-space border text-center px-4 py-2">
                              {formatNumber(he_so_thuong[0].hsbqthg)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* dạng dọc */}
                    {/* <div className="overflow-y-scroll" style={{ height: 300 }}>
                      <table className="table table-striped h-100">
                        <tbody>
                          <tr>
                            <td>1:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot1)}
                            </td>
                          </tr>
                          <tr>
                            <td>2:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot2)}
                            </td>
                          </tr>
                          <tr>
                            <td>3:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot3)}
                            </td>
                          </tr>
                          <tr>
                            <td>4:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot4)}
                            </td>
                          </tr>
                          <tr>
                            <td>5:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot5)}
                            </td>
                          </tr>
                          <tr>
                            <td>6:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot6)}
                            </td>
                          </tr>
                          <tr>
                            <td>7:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot7)}
                            </td>
                          </tr>
                          <tr>
                            <td>8:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot8)}
                            </td>
                          </tr>
                          <tr>
                            <td>9:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot9)}
                            </td>
                          </tr>
                          <tr>
                            <td>10:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot10)}
                            </td>
                          </tr>
                          <tr>
                            <td>11:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot11)}
                            </td>
                          </tr>
                          <tr>
                            <td>12:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot12)}
                            </td>
                          </tr>
                          <tr>
                            <td>13:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot13)}
                            </td>
                          </tr>
                          <tr>
                            <td>14:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot14)}
                            </td>
                          </tr>
                          <tr>
                            <td>15:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot15)}
                            </td>
                          </tr>
                          <tr>
                            <td>16:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot16)}
                            </td>
                          </tr>
                          <tr>
                            <td>17:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot17)}
                            </td>
                          </tr>
                          <tr>
                            <td>18:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot18)}
                            </td>
                          </tr>
                          <tr>
                            <td>19:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot19)}
                            </td>
                          </tr>
                          <tr>
                            <td>20:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot20)}
                            </td>
                          </tr>
                          <tr>
                            <td>21:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot21)}
                            </td>
                          </tr>
                          <tr>
                            <td>22:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot22)}
                            </td>
                          </tr>
                          <tr>
                            <td>23:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot23)}
                            </td>
                          </tr>
                          <tr>
                            <td>24:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot24)}
                            </td>
                          </tr>
                          <tr>
                            <td>25:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot25)}
                            </td>
                          </tr>
                          <tr>
                            <td>26:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot26)}
                            </td>
                          </tr>
                          <tr>
                            <td>27:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot27)}
                            </td>
                          </tr>
                          <tr>
                            <td>28:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot28)}
                            </td>
                          </tr>
                          <tr>
                            <td>29:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot29)}
                            </td>
                          </tr>
                          <tr>
                            <td>30:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot30)}
                            </td>
                          </tr>
                          <tr>
                            <td>31:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].cot31)}
                            </td>
                          </tr>
                          <tr>
                            <td>vpcl:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].vpcl)}
                            </td>
                          </tr>
                          <tr>
                            <td>vpcl:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].vpkl)}
                            </td>
                          </tr>
                          <tr>
                            <td>o:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].o)}
                            </td>
                          </tr>
                          <tr>
                            <td>hsbq:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].hsbq)}
                            </td>
                          </tr>
                          <tr>
                            <td>hsbqthg:</td>
                            <td className="text-end">
                              {formatNumber(he_so_thuong[0].hsbqthg)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "gio_cong_gian_ca":
        return (
          <>
            {!gio_cong_gian_ca[0] ? (
              <div className="alert alert-warning">
                Không tìm thấy thông tin công cho loại này.
              </div>
            ) : (
              <div className="modal-body">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                      T{gio_cong_gian_ca[0]?.bang_cong_t}
                    </h4>
                  </div>
                  <div className="card-body">
                    <h5 className="mb-3">Thông tin cá nhân</h5>
                    <p>
                      <strong>Họ tên: </strong>
                      {`${gio_cong_gian_ca[0].ho} ${gio_cong_gian_ca[0].ten}`}
                    </p>
                    <p>
                      <strong>Số thẻ:</strong> LH{gio_cong_gian_ca[0].so_the}
                    </p>

                    <h5 className="mt-4">Chi tiết công</h5>

                    {/* dạng đứng */}
                    <div className="overflow-x-scroll">
                      <table className="border border-collapse">
                        <thead>
                          <tr>
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
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(gio_cong_gian_ca[0].hanh_Chinh_Ca)}
                            </td>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(gio_cong_gian_ca[0].ca3)}
                            </td>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(gio_cong_gian_ca[0].ngay_Thuong)}
                            </td>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(
                                gio_cong_gian_ca[0].ngay_Nghi_Hang_Tuan
                              )}
                            </td>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(gio_cong_gian_ca[0].ngay_Le)}
                            </td>
                            <td className="text-end white-space border text-center px-4 py-2">
                              {formatNumber(gio_cong_gian_ca[0].phep)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* dọc */}
                    {/* <div className="overflow-y-scroll" style={{ height: 300 }}>
                      <table className="table table-striped h-100">
                        <tbody>
                          <tr>
                            <td>STT:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].stt)}
                            </td>
                          </tr>
                          <tr>
                            <td>Hành chính + Ca1 + Ca2:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].hanh_Chinh_Ca)}
                            </td>
                          </tr>
                          <tr>
                            <td>Ca3:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].ca3)}
                            </td>
                          </tr>
                          <tr>
                            <td>Ngày thường:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].ngay_Thuong)}
                            </td>
                          </tr>
                          <tr>
                            <td>Ngày nghỉ hàng tuần:</td>
                            <td className="text-end">
                              {formatNumber(
                                gio_cong_gian_ca[0].ngay_Nghi_Hang_Tuan
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Ngày lễ:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].ngay_Le)}
                            </td>
                          </tr>
                          <tr>
                            <td>Phép:</td>
                            <td className="text-end">
                              {formatNumber(gio_cong_gian_ca[0].phep)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Thông tin công</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <ul className="nav nav-tabs mb-2">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    currentView === "cong_main" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("cong_main")}
                >
                  Công Chính
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    currentView === "he_so_thuong" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("he_so_thuong")}
                >
                  Hệ số Thưởng
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    currentView === "gio_cong_gian_ca" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("gio_cong_gian_ca")}
                >
                  Giờ công giãn ca
                </button>
              </li>
            </ul>
            {renderContent()}
          </div>

          <div className="modal-footer">
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

export default WorkingHoursModal;
