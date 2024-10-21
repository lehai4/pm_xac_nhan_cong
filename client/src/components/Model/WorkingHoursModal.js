import { useState } from "react";
import { getDaysInMonth, formatNumber } from "../../utils";

export const AttendanceTableHST = ({ data, dateInput }) => {
  const days = getDaysInMonth(dateInput);

  const daysData = [
    data.cot1,
    data.cot2,
    data.cot3,
    data.cot4,
    data.cot5,
    data.cot6,
    data.cot7,
    data.cot8,
    data.cot9,
    data.cot10,
    data.cot11,
    data.cot12,
    data.cot13,
    data.cot14,
    data.cot15,
    data.cot16,
    data.cot17,
    data.cot18,
    data.cot19,
    data.cot20,
    data.cot21,
    data.cot22,
    data.cot23,
    data.cot24,
    data.cot25,
    data.cot26,
    data.cot27,
    data.cot28,
    data.cot29,
    data.cot30,
    data.cot31,
  ].slice(0, days);

  return (
    <div className="overflow-y-scroll" style={{ height: 300 }}>
      <table className="table table-striped h-100" border="1">
        <tbody>
          {daysData.map((dayData, index) => (
            <tr key={index}>
              <td>Ngày {index + 1}:</td>
              <td className="text-end">
                {dayData !== null ? formatNumber(dayData) : 0}
              </td>
            </tr>
          ))}
          <tr>
            <td>VPCL:</td>
            <td className="text-end">{formatNumber(data.vpcl)}</td>
          </tr>
          <tr>
            <td>VPKL:</td>
            <td className="text-end">{formatNumber(data.vpkl)}</td>
          </tr>
          <tr>
            <td>O:</td>
            <td className="text-end">{formatNumber(data.o)}</td>
          </tr>
          <tr>
            <td>HSBQ:</td>
            <td className="text-end">{formatNumber(data.hsbq)}</td>
          </tr>
          <tr>
            <td>HSBQTHG:</td>
            <td className="text-end">{formatNumber(data.hsbqthg)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const AttendanceMain = ({ data }) => {
  return (
    <div className="overflow-y-scroll" style={{ height: 300 }}>
      <table className="table table-striped h-100">
        <tbody>
          <tr>
            <td>Hành chính + Ca1 + Ca2:</td>
            <td className="text-end">
              {formatNumber(data.hanh_chinh_ca1_ca2)}
            </td>
          </tr>
          <tr>
            <td>Ca3:</td>
            <td className="text-end">{formatNumber(data.ca3)}</td>
          </tr>
          <tr>
            <td>Ngày thường:</td>
            <td className="text-end">{formatNumber(data.ngay_thuong)}</td>
          </tr>
          <tr>
            <td>Ngày nghỉ hàng tuần:</td>
            <td className="text-end">
              {formatNumber(data.ngay_nghi_hang_tuan)}
            </td>
          </tr>
          <tr>
            <td>Ngày lễ:</td>
            <td className="text-end">{formatNumber(data.ngay_le)}</td>
          </tr>
          <tr>
            <td>Giờ công thai thứ 7:</td>
            <td className="text-end">{formatNumber(data.gc_thai_thu_7)}</td>
          </tr>
          <tr>
            <td>Giờ công nuôi con nhỏ:</td>
            <td className="text-end">{formatNumber(data.gc_nuoi_con_nho)}</td>
          </tr>
          <tr>
            <td>Giờ công người cao tuổi:</td>
            <td className="text-end">{formatNumber(data.gc_nguoi_cao_tuoi)}</td>
          </tr>
          <tr>
            <td>Giờ công công tác:</td>
            <td className="text-end">{formatNumber(data.gc_cong_tac)}</td>
          </tr>
          <tr>
            <td>Phép(giờ):</td>
            <td className="text-end">{formatNumber(data.phep)}</td>
          </tr>
          <tr>
            <td>Ốm(giờ):</td>
            <td className="text-end">{formatNumber(data.om)}</td>
          </tr>
          <tr>
            <td>Con ốm(giờ):</td>
            <td className="text-end">{formatNumber(data.con_om)}</td>
          </tr>
          <tr>
            <td>Việc riêng có lương(giờ):</td>
            <td className="text-end">
              {formatNumber(data.viec_rieng_co_luong)}
            </td>
          </tr>
          <tr>
            <td>Việc riêng không lương(giờ):</td>
            <td className="text-end">
              {formatNumber(data.viec_rieng_khong_luong)}
            </td>
          </tr>
          <tr>
            <td>Không lý do(giờ):</td>
            <td className="text-end">{formatNumber(data.khong_ly_do)}</td>
          </tr>
          <tr>
            <td>Việc riêng không lương(giờ):</td>
            <td className="text-end">
              {formatNumber(data.viec_rieng_khong_luong)}
            </td>
          </tr>
          <tr>
            <td>Khám thai(giờ):</td>
            <td className="text-end">{formatNumber(data.kham_thai)}</td>
          </tr>
          <tr>
            <td>Thai sản(giờ):</td>
            <td className="text-end">{formatNumber(data.thai_san)}</td>
          </tr>
          <tr>
            <td>Dưỡng sức(giờ):</td>
            <td className="text-end">{formatNumber(data.duong_suc)}</td>
          </tr>
          <tr>
            <td>Trong giờ:</td>
            <td className="text-end">{formatNumber(data.trong_gio)}</td>
          </tr>
          <tr>
            <td>Ngoài giờ:</td>
            <td className="text-end">{formatNumber(data.ngoai_gio)}</td>
          </tr>
          <tr>
            <td>Giờ công ngừng việc:</td>
            <td className="text-end">{formatNumber(data.gc_ngung_viec)}</td>
          </tr>
          <tr>
            <td>Giờ công nghỉ lễ:</td>
            <td className="text-end">{formatNumber(data.gc_nghi_le)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const WorkingHoursModal = (props) => {
  const { onClose, employee, currentView, setCurrentView } = props;

  const { he_so_thuong, gio_cong_gian_ca, cong_main } = employee;

  const [dateInput] = useState(
    cong_main[0].bang_cong_t ||
      he_so_thuong[0].bang_cong_t ||
      gio_cong_gian_ca[0].bang_cong_t
  );

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
                    {/* Ngang */}
                    {/* <div className="overflow-x-auto">
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
                    </div> */}
                    {/* Dọc */}
                    <AttendanceMain data={cong_main[0]} />
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
                    {/* <div className="overflow-x-scroll">
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
                    </div> */}
                    {/* dạng dọc */}
                    <AttendanceTableHST
                      data={he_so_thuong[0]}
                      dateInput={dateInput}
                    />
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
                    {/* <div className="overflow-x-scroll">
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
                    </div> */}
                    {/* dọc */}
                    <div className="overflow-y-scroll" style={{ height: 300 }}>
                      <table className="table table-striped h-100">
                        <tbody>
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
                    </div>
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
