import React, { useState, useEffect } from "react";
import { formatNumber, getDaysInMonth } from "../../utils";
import moment from "moment";

const BangCong = ({
  data,
  dateInput,
  currentTable,
  onNext,
  isWithinViewingPeriodMain,
  isWithinViewingPeriodHST,
  isWithinViewingPeriodGCGC,
  timeStartHST,
  timeEndHST,
  timeStartGCGC,
  timeEndGCGC,
  timeStartMain,
  showDetails,
  timeEndMain,
}) => {
  const [timer, setTimer] = useState(null); // Để kiểm soát thời gian xem
  const [isConfirmed, setIsConfirmed] = useState(false); // Trạng thái xác nhận

  // Mô phỏng thời gian dựa trên dữ liệu (bạn có thể điều chỉnh logic này)
  useEffect(() => {
    if (data) {
      const timeLimit = data.length * 1000; // Ví dụ: 1 giây cho mỗi hàng
      setTimer(
        setTimeout(() => {
          if (!isConfirmed) {
            alert("Hết thời gian! Vui lòng xác nhận.");
          }
        }, timeLimit)
      );
    }
    return () => clearTimeout(timer); // Xóa bộ đếm thời gian khi component bị unmount
  }, [data, isConfirmed]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    clearTimeout(timer); // Dừng bộ đếm thời gian khi đã xác nhận
    onNext(); // Chuyển sang bảng tiếp theo
  };

  const handleFeedback = () => {
    // Mở form hoặc modal phản hồi (triển khai dựa trên giao diện người dùng của bạn)

    alert("Vui lòng gửi phản hồi");
  };

  const days = Array.from(
    { length: getDaysInMonth(dateInput) },
    (_, i) => i + 1
  );
  const renderMaindata = () => {
    return <div>hihi</div>;
  };
  const renderHSTdata = () => {
    if (!isWithinViewingPeriodHST()) {
      return (
        <div className="alert alert-warning text-center">
          Phiếu công chỉ có thể xem từ{" "}
          {timeStartHST
            ? moment(timeStartHST).format("DD/MM/YYYY HH:mm:ss")
            : ""}{" "}
          đến{" "}
          {timeEndHST ? moment(timeEndHST).format("DD/MM/YYYY HH:mm:ss") : ""}.
        </div>
      );
    }
    return (
      <>
        {!showDetails ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-warning text-center">
                Mời bạn bấm vào <strong>"Xem công"</strong> để xem chi tiết
                phiếu công
              </div>
            </div>
            <div className="col-12 text-center">
              <button
                type="button"
                // onClick={handleShowDetail}
                className="btn btn-primary"
              >
                Xem công
              </button>
            </div>
          </div>
        ) : (
          <div className="card salary-details">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">BẢNG CÔNG CÁ NHÂN T</h4>
            </div>
            <div className="card-body">
              <h5 className="mb-3">Thông tin cá nhân</h5>
              <p>
                <strong>Họ tên:</strong> {data.ho} {data.ten}
              </p>
              <p>
                <strong>Số thẻ:</strong> LH{data.so_the}
              </p>
              <p>
                <strong>Tổ:</strong> {data.f_To}
              </p>

              <button className="btn btn-primary mb-3" onClick={() => {}}>
                Xem chi tiết công
              </button>
              <>
                <h5>Hệ số thưởng</h5>
                <div className="overflow-x-scroll" style={{ width: "100%" }}>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        {days.map((day) => (
                          <th
                            className="white-space text-center dotcongTh borderRight"
                            key={day}
                          >
                            Ngày {day}
                          </th>
                        ))}
                        <th className="white-space text-center dotcongTh borderRight">
                          Vpcl
                        </th>
                        <th className="white-space text-center dotcongTh borderRight">
                          Vpkl
                        </th>
                        <th className="white-space text-center dotcongTh borderRight">
                          O
                        </th>
                        <th className="white-space text-center dotcongTh borderRight">
                          Hsbq
                        </th>
                        <th className="white-space text-center dotcongTh borderRight">
                          Hsbq Thg
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="white-space text-center dotcongTh borderRight">
                          {formatNumber(data.cot1)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot2)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot3)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot4)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot5)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot6)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot7)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot8)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot9)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot10)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot11)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot12)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot13)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot14)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot15)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot16)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot17)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot18)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot19)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot20)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot21)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot22)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot23)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot24)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot25)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot26)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot27)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot28)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot29)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot30)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.cot31)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.vpcl)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.vpkl)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.o)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.hsbq)}
                        </td>
                        <td className="text-center white-space borderRight">
                          {formatNumber(data.hsbqthg)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>

              <div>
                {/* {!showConfirmation && !showFeedbackForm && (
                <div className="d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() => handlePauseAndAction(setShowConfirmation)}
                  >
                    Xác nhận
                  </button>
                  {!complaintDotCongs && !isComplaint && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePauseAndAction(setShowFeedbackForm)}
                    >
                      Gửi câu hỏi
                    </button>
                  )}
                </div>
              )} */}

                {/* <div
                    className={`modal fade ${
                      showConfirmation ? "show d-block" : ""
                    }`}
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(13, 110, 253,0.1)" }}
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Xác nhận</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() =>
                              handleResumeAndAction(setShowConfirmation)
                            }
                          ></button>
                        </div>
                        <div className="modal-body">
                          <p>
                            {GCGC
                              ? "Bạn còn 1 bước nữa để xác nhận"
                              : "Bạn xác nhận những thông tin trong phiếu công đã chính xác?"}
                          </p>
                        </div>
                        <div className="modal-footer">
                          <button
                            className="btn btn-success"
                            onClick={() => handleConfirm("data")}
                          >
                            Xác nhận
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() =>
                              handleResumeAndAction(setShowConfirmation)
                            }
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`modal fade ${
                      showFeedbackForm ? "show d-block" : ""
                    }`}
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(13, 110, 253,0.1)" }}
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Phản hồi</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() =>
                              handleResumeAndAction(setShowFeedbackForm)
                            }
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleFeedbackSubmit}>
                            <div className="mb-3">
                              <label className="form-label">
                                Bạn đang có câu hỏi về nội dung:{" "}
                              </label>
                              {feedbackOptions.map((option, index) => (
                                <div className="form-check my-3" key={index}>
                                  <input
                                    className="form-check-input border border-2 border-dark"
                                    type="checkbox"
                                    value={option}
                                    id={`flexCheck${index}`}
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => handleCheckboxChange(option)}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`flexCheck${index}`}
                                  >
                                    {option}
                                  </label>
                                </div>
                              ))}
                              {selectedOptions.includes("Khác") && (
                                <>
                                  <label
                                    htmlFor="feedback"
                                    className="form-label"
                                  >
                                    Nội dung phản hồi
                                  </label>
                                  <textarea
                                    id="feedback"
                                    className="form-control"
                                    rows="4"
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                    required
                                    placeholder="Nhập lý do tại đây..."
                                  ></textarea>
                                </>
                              )}
                            </div>
                            <button type="submit" className="btn btn-primary">
                              Gửi
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                handleResumeAndAction(setShowFeedbackForm)
                              }
                            >
                              Hủy
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div> */}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  const renderGCGCdata = () => {
    return <div>hihi</div>;
  };
  return (
    <div>
      {currentTable === 1 && renderMaindata()}
      {currentTable === 2 && renderHSTdata()}
      {currentTable === 3 && renderGCGCdata()}
      <button onClick={handleConfirm}>Xác nhận</button>
      <button onClick={handleFeedback}>Gửi phản hồi</button>
    </div>
  );
};

export default BangCong;
