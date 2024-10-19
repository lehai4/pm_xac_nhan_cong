import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { API_BASE_URL } from "../config/api";
import { FaCheck } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { FcFeedback, FcOk } from "react-icons/fc";

const SalaryDetails = () => {
  const [feedback, setFeedback] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [chiTrong, setChiTrong] = useState(null);
  const [chiNgoai, setChiNgoai] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dotLuongTrong, setDotLuongTrong] = useState(null);
  const [dotLuongNgoai, setDotLuongNgoai] = useState(null);
  const [countdownTrong, setCountdownTrong] = useState(null); // Khởi tạo countdown
  const [countdownNgoai, setCountdownNgoai] = useState(null); // Khởi tạo countdown
  const [showDetails, setShowDetails] = useState(false); // Trạng thái để điều khiển hiển thị chi tiết
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState(null);
  // Thêm state mới để lưu trữ các khoảng thời gian đã dừng
  const [pausedTimes, setPausedTimes] = useState([]);
  const intervalRef = useRef(null);
  const [showCN, setShowCN] = useState(false);
  const [timeStart, setTimeStart] = useState(null);
  const [timeEnd, setTimeEnd] = useState(null);
  const [timeStartNgoai, setTimeStartNgoai] = useState(null);
  const [timeEndNgoai, setTimeEndNgoai] = useState(null);
  const [hasCTViewed, setHasCTViewed] = useState(false);

  const ma_nv = localStorage.getItem("ma_nv");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Chi Trong data
        const fetchChiTrong = async () => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/chitrong/active-chitrong/${ma_nv}`
            );
            if (response.data && response.data.length > 0) {
              const chiTrong = response.data[0];
              setChiTrong(chiTrong);

              const dotLuongResponse = await axios.get(
                `${API_BASE_URL}/dotluong/${chiTrong.id_dot}`
              );
              const dotLuong = dotLuongResponse.data;
              setDotLuongTrong(dotLuong);
              setCountdownTrong(dotLuong.time_xem);
              setTimeStart(new Date(dotLuong.time_start));
              setTimeEnd(new Date(dotLuong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Chi Trong:", error);
            setChiTrong(null);
            setDotLuongTrong(null);
          }
        };

        // Fetch Chi Ngoai data
        const fetchChiNgoai = async () => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/chingoai/active-chingoai/${ma_nv}`
            );
            if (response.data && response.data.length > 0) {
              console.log(response.data);
              const chiNgoai = response.data[0];
              setChiNgoai(chiNgoai);

              const dotLuongResponse = await axios.get(
                `${API_BASE_URL}/dotluong/${chiNgoai.id_dot}`
              );
              const dotLuong = dotLuongResponse.data;
              setDotLuongNgoai(dotLuong);
              setCountdownNgoai(dotLuong.time_xem);
              setTimeStartNgoai(new Date(dotLuong.time_start));
              setTimeEndNgoai(new Date(dotLuong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Chi Ngoai:", error);
            setChiNgoai(null);
            setDotLuongNgoai(null);
            setCountdownNgoai(null);
          }
        };

        // Thực hiện cả hai fetch cùng lúc
        await Promise.all([fetchChiTrong(), fetchChiNgoai()]);

        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể lấy dữ liệu lương");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ma_nv, API_BASE_URL]);

  const handleConfirm = useCallback(
    async (phieuType) => {
      const isCT = phieuType === "CT";
      const currentSalary = isCT ? chiTrong : chiNgoai;

      if (!currentSalary) {
        console.error("Không tìm thấy dữ liệu lương");
        alert("Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.");
        return;
      }

      const statusLuong = {
        id_trong: isCT ? currentSalary.id : null,
        id_ngoai: isCT ? null : currentSalary.id,
        id_dot: currentSalary.id_dot,
        time_con_lai: pausedTimes,
        tinh_trang: isComplaint ? "Câu hỏi" : "Đã xác nhận",
        ...(isComplaint && { tinh_trang_nld_khieu_nai: "Đã xác nhận" }),
      };

      try {
        await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
        setShowConfirmation(false);

        if (isCT && chiNgoai) {
          setHasCTViewed(true);
          setShowCN(true);
          setIsRunning(true);
          startTimerNgoai();
        } else {
          setShowSuccessMessage(true);
          setMessage("Bạn đã xác nhận phiếu lương thành công!");
          setShowDetails(false);
          if (isCT) setShowCN(false);
        }
      } catch (error) {
        console.error("Lỗi khi xác nhận:", error);
        alert("Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.");
      }
    },
    [chiTrong, chiNgoai, pausedTimes, API_BASE_URL]
  );
  const [showModal, setShowModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(true);
  // Option feedback
  const feedbackOptions = [
    "Phụ cấp con nhỏ",
    "Thưởng CBCNV giỏi",
    "Thưởng kết quả sản xuất",
    "Khác",
  ];

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevOptions) => {
      if (prevOptions.includes(option)) {
        return prevOptions.filter((item) => item !== option);
      } else {
        return [...prevOptions, option];
      }
    });
  };

  const handleFeedbackSubmit = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
    setIsConfirming(true);
  }, []);


  const [isSending, setIsSending] = useState(false);

  // Câu hỏi
  const confirmSubmit = async () => {
    if (isSending) return; // Prevent multiple submissions
    // Kiểm tra xem có ít nhất một option được chọn không
    if (selectedOptions.length === 0) {
      setError("Vui lòng chọn ít nhất một lý do.");
      return;
    }

    // Kiểm tra xem nếu "Khác" được chọn, có nội dung phản hồi không
    if (selectedOptions.includes("Khác") && feedback.trim() === "") {
      setError('Vui lòng nhập nội dung phản hồi khi chọn "Khác".');
      return;
    }

    setIsSending(true); // Set sending state to true
    // Tạo chuỗi phản hồi
    let feedbackString = selectedOptions
      .filter((option) => option !== "Khác")
      .join(", ");

    if (selectedOptions.includes("Khác")) {
      if (feedbackString) {
        feedbackString += ", " + feedback;
      } else {
        feedbackString = feedback;
      }
    }

    const statusLuong = {
      id_trong: !showCN ? chiTrong.id : null,
      id_ngoai: showCN ? chiNgoai.id : null,
      id_dot: !showCN ? chiTrong.id_dot : chiNgoai.id_dot,
      time_con_lai: pausedTimes,
      tinh_trang: "Câu hỏi",
      noi_dung_kn: feedbackString,
      last_modified: new Date(),
    };
    try {
      await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
      setFeedback("");
      setShowFeedbackForm(false);
      setSelectedOptions([]);
      setIsConfirming(false);
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      alert("Có lỗi xảy ra khi gửi câu hỏi. Vui lòng thử lại.");
      setShowModal(false);
    } finally {
      setIsSending(false); // Reset sending state
    }
  };

  const handleModalClose = () => {
    if (!isConfirming) {
      setShowModal(false);
      if (!showCN && chiNgoai) {
        setHasCTViewed(true);
        setShowCN(true);
        setIsRunning(true);
        startTimerNgoai();
      } else {
        setShowSuccessMessage(true);
        setShowDetails(false);
        setMessage("Bạn đã gửi câu hỏi thành công!");
      }
    } else {
      setShowModal(false);
    }
  };

  const inFormOrLink = true; // Replace this with your actual logic
  // const [canSendData, setCanSendData] = useState(false);

  // const getStatusLuong = useCallback(() => {
  //   if (!canSendData) return null;
  //   return {
  //     id_trong: !showCN ? chiTrong?.id : null,
  //     id_ngoai: showCN ? chiNgoai?.id : null,
  //     id_dot: !showCN ? chiTrong?.id_dot : chiNgoai?.id_dot,
  //     time_con_lai: pausedTimes,
  //     tinh_trang: "Chuyển trang",
  //     last_modified: new Date(),
  //   };
  // }, [canSendData, showCN, chiTrong, chiNgoai, pausedTimes]);

  // const { setShowWarning, setWarningData } = useNavigationWarning(
  //   getStatusLuong,
  //   API_BASE_URL
  // );

  // useEffect(() => {
  //   setShowWarning(
  //     showDetails && !showSuccessMessage && inFormOrLink && canSendData
  //   );
  //   setWarningData(getStatusLuong());
  // }, [
  //   showDetails,
  //   showSuccessMessage,
  //   inFormOrLink,
  //   canSendData,
  //   getStatusLuong,
  //   setShowWarning,
  //   setWarningData,
  // ]);

  // Thoát trang
  useEffect(() => {
    console.log("pausedTimes", +1);
    const handleBeforeUnload = async (event) => {
      updateRemainingTime(); // Cập nhật thời gian còn lại ngay trước khi unload

      if (showDetails && !showSuccessMessage && inFormOrLink) {
        event.preventDefault();
        event.returnValue = "Do you really want to close?"; // For modern browsers

        // Đặt một biến trạng thái để gửi dữ liệu
        const statusLuong = {
          id_trong: !showCN ? chiTrong.id : null,
          id_ngoai: showCN ? chiNgoai.id : null,
          id_dot: !showCN ? chiTrong.id_dot : chiNgoai.id_dot,
          time_con_lai: pausedTimes,
          tinh_trang: isComplaint ? "Câu hỏi" : "Tắt trang",
          tinh_trang_nld_khieu_nai: isComplaint ? "Đã xác nhận" : "",
          last_modified: new Date(),
        };

        // Gửi dữ liệu khi người dùng thực sự rời khỏi trang
        const sendData = async () => {
          try {
            await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
            console.log("Dữ liệu đã được gửi thành công");
          } catch (error) {
            console.error("Lỗi khi gửi dữ liệu:", error);
          }
        };

        // Gọi hàm gửi dữ liệu
        sendData();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    inFormOrLink,
    showDetails,
    showSuccessMessage,
    chiTrong,
    chiNgoai,
    pausedTimes,
    showCN,
  ]);

  // Đã tối ưu
  const handlePauseAndAction = (action, isForCN = false) => {
    handleTimerAction("pause", isForCN);
    action(true);
  };

  const handleResumeAndAction = (action, isForCN = false) => {
    handleTimerAction("resume", isForCN);
    action(false);
  };

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  // Cập nhật thời gian còn lại
  // Bản mới
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showGiaHan, setShowGiaHan] = useState(false);
  const warningIntervalRef = useRef(null);
  const lastWarningTimeRef = useRef(null);
  const [hiddenCountdown, setHiddenCountdown] = useState(null);
  const hiddenIntervalRef = useRef(null);

  const checkTimeRemaining = async (countdown) => {
    const [hours, minutes, seconds] = countdown.split(":").map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const currentTime = new Date();

    // Nếu đang trong thời gian gia hạn ẩn, sử dụng hiddenCountdown
    if (hiddenCountdown) {
      totalSeconds = hiddenCountdown;
    }

    const idTrongNgoai = !showCN ? chiTrong.id : chiNgoai.id;
    const idDot = !showCN ? chiTrong.id_dot : chiNgoai.id_dot;

    try {
      const timeGiaHan = await axios.get(
        `${API_BASE_URL}/statusluong/check-extension/${idTrongNgoai}/${idDot}`
      );

      if (
        totalSeconds === 120 ||
        totalSeconds === 90 ||
        (totalSeconds <= 60 && totalSeconds % 30 === 0)
      ) {
        console.log("Hiển thị cảnh báo thời gian:", totalSeconds);
        setShowTimeWarning(true);
        lastWarningTimeRef.current = currentTime;
      }

      // Chỉ hiển thị tùy chọn gia hạn khi không trong thời gian gia hạn ẩn
      if (!hiddenCountdown) {
        if (
          totalSeconds <= 30 &&
          timeGiaHan.data.hasRequestedExtension.data[0] === 1
        ) {
          console.log("Hiển thị tùy chọn gia hạn");
          setShowGiaHan(true);
          lastWarningTimeRef.current = currentTime;
        } else {
          setShowGiaHan(false);
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra gia hạn:", error);
    }
  };

  const handleGiaHan = async () => {
    setShowGiaHan(false);
    setShowTimeWarning(false);

    const addTwoMinutes = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(":").map(Number);
      let totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return totalSeconds + 180; // Thêm 180 giây (3 phút)
    };

    try {
      const idTrongNgoai = !showCN ? chiTrong.id : chiNgoai.id;
      const idDot = !showCN ? chiTrong.id_dot : chiNgoai.id_dot;

      await axios.put(
        `${API_BASE_URL}/statusluong/update-status-luong-xin-gia-han/${idTrongNgoai}/${idDot}`,
        {
          xin_gia_han: false,
        }
      );

      const currentTime = showCN ? countdownNgoai : countdownTrong;
      const extendedTime = addTwoMinutes(currentTime);
      console.log("Thời gian gia hạn (giây):", extendedTime);
      setHiddenCountdown(extendedTime);

      clearInterval(intervalRef.current);
      startHiddenTimer();
    } catch (error) {
      console.error("Error while extending time:", error);
    }
  };

  const startHiddenTimer = () => {
    if (hiddenIntervalRef.current) clearInterval(hiddenIntervalRef.current);

    console.log("Bắt đầu đếm ngược ẩn");
    hiddenIntervalRef.current = setInterval(() => {
      setHiddenCountdown((prevCountdown) => {
        if (prevCountdown > 0) {
          console.log("Thời gian ẩn còn lại:", prevCountdown - 1);
          checkTimeRemaining(formatTime(prevCountdown - 1));
          return prevCountdown - 1;
        } else {
          clearInterval(hiddenIntervalRef.current);
          console.log("Kết thúc đếm ngược ẩn, chuyển sang 30 giây cuối");
          const newTime = "00:00:30";
          setHiddenCountdown(null);
          if (showCN) {
            setCountdownNgoai(newTime);
            startTimerNgoai();
          } else {
            setCountdownTrong(newTime);
            startTimerTrong();
          }
          return null;
        }
      });
    }, 1000);
  };

  const handleCloseWarning = () => {
    setShowTimeWarning(false);
    if (showCN) {
      setCountdownNgoai(pausedTimes);
      startTimerNgoai();
    } else {
      setCountdownTrong(pausedTimes);
      startTimerTrong();
    }
  };

  const updateRemainingTime = useCallback(() => {
    if (isRunning) {
      const currentTime = !showCN ? countdownTrong : countdownNgoai;
      setPausedTimes(currentTime);
    }
  }, [isRunning, showCN, countdownTrong, countdownNgoai]);

  useEffect(() => {
    const timer = setInterval(updateRemainingTime, 500);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hiddenIntervalRef.current) clearInterval(hiddenIntervalRef.current);
    };
  }, []);

  const startTimerTrong = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hiddenCountdown) return;

      setCountdownTrong((prevCountdown) => {
        const [hours, minutes, seconds] = prevCountdown.split(":").map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds > 0) {
          totalSeconds--;
          const newCountdown = formatTime(totalSeconds);
          checkTimeRemaining(newCountdown);
          return newCountdown;
        } else {
          handleTimeUp(false);
          return "00:00:00";
        }
      });
    }, 1000);
  };

  const startTimerNgoai = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hiddenCountdown) return;

      setCountdownNgoai((prevCountdown) => {
        const [hours, minutes, seconds] = prevCountdown.split(":").map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds > 0) {
          totalSeconds--;
          const newCountdown = formatTime(totalSeconds);
          checkTimeRemaining(newCountdown);
          return newCountdown;
        } else {
          handleTimeUp(true);
          return "00:00:00";
        }
      });
    }, 1000);
  };

  const handleTimeUp = async (isNgoai) => {
    clearInterval(intervalRef.current);
    clearInterval(warningIntervalRef.current);
    setIsRunning(false);
    setShowTimeWarning(false);

    const statusLuong = {
      id_trong: isNgoai ? null : chiTrong.id,
      id_ngoai: isNgoai ? chiNgoai.id : null,
      id_dot: isNgoai ? chiNgoai.id_dot : chiTrong.id_dot,
      time_con_lai: "00:00:00",
      tinh_trang: isComplaint ? "Câu hỏi" : "Hết giờ",
      tinh_trang_nld_khieu_nai: isComplaint ? "Đã xác nhận" : "",
    };

    try {
      await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
      setShowDetails(false);
      setShowSuccessMessage(true);
      setMessage("Bạn đã hết thời gian xem phiếu lương!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái hết giờ:", error);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const handleTimerAction = (action, isForCN = false) => {
    if (action === "pause") {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setPausedTimes(isForCN ? countdownNgoai : countdownTrong);
    } else if (action === "resume") {
      setIsRunning(true);
      if (isForCN) {
        startTimerNgoai();
      } else {
        startTimerTrong();
      }
    }
  };

  const [complaintSalaries, setComplaintSalaries] = useState(null);
  const [isComplaint, setIsComplaint] = useState(false);

  const handleShowDetail = async () => {
    try {
      const isCT = Boolean(chiTrong);
      const currentSalary = isCT ? chiTrong : chiNgoai;
      const currentDotLuong = isCT ? dotLuongTrong : dotLuongNgoai;

      if (!currentSalary) {
        throw new Error("Không có dữ liệu lương để hiển thị");
      }

      setShowCN(!isCT);

      // Kiểm tra Câu hỏi
      const complaintEndpoint = isCT ? "complaints" : "complaintscn";
      const { data: complaints } = await axios.get(
        `${API_BASE_URL}/statusLuong/${complaintEndpoint}/${currentSalary.id_dot}/${currentSalary.id}`
      );
      if (complaints && complaints.length > 0) {
        setComplaintSalaries(complaints[0]);
        setIsComplaint(true);
      } else {
        // Nếu không có Câu hỏi, kiểm tra và cập nhật trạng thái xem
        const outPageEndpoint = isCT ? "out-page" : "out-pagecn";
        const { data: outPageData } = await axios.get(
          `${API_BASE_URL}/statusLuong/${outPageEndpoint}/${currentSalary.id_dot}/${currentSalary.id}`
        );

        if (outPageData.length === 0) {
          const statusLuong = {
            id_trong: isCT ? currentSalary.id : null,
            id_ngoai: isCT ? null : currentSalary.id,
            id_dot: currentSalary.id_dot,
            time_con_lai: currentDotLuong.time_xem,
            tinh_trang: "Đang xem",
            last_modified: new Date().toISOString(),
          };

          await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
        } else {
          isCT
            ? setCountdownTrong(outPageData[0].time_con_lai)
            : setCountdownNgoai(outPageData[0].time_con_lai);
          console.log("Đã có bản ghi OutPage, không tạo mới.");
        }
      }

      setShowDetails(true);
      setIsRunning(true);
      isCT ? startTimerTrong() : startTimerNgoai();
    } catch (error) {
      console.error("Lỗi khi xử lý chi tiết lương:", error);
      alert("Có lỗi xảy ra khi bắt đầu xem chi tiết lương. Vui lòng thử lại.");
    }
  };
  // Chi ngoài
  const handleFeedbackSubmitCN = async (e) => {
    e.preventDefault();
    console.log("Phản hồi đã gửi:", feedback);

    // Tạo chuỗi phản hồi
    let feedbackString = selectedOptions
      .filter((option) => option !== "Khác")
      .join(", ");

    if (selectedOptions.includes("Khác")) {
      if (feedbackString) {
        feedbackString += ", " + feedback;
      } else {
        feedbackString = feedback;
      }
    }

    const statusLuong = {
      id_ngoai: chiNgoai.id,
      id_dot: chiNgoai.id_dot,
      time_con_lai: pausedTimes,
      tinh_trang: "Câu hỏi",
      noi_dung_kn: feedbackString,
    };
    await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
    setFeedback("");
    setSelectedOptions([]);
    setShowFeedbackForm(false);
    setShowSuccessMessage(true); // Thêm dòng này để hiển thị thông báo thành công
    setShowDetails(false); // Ẩn chi tiết lương nếu cần
    setMessage("Bạn đã gửi câu hỏi thành công!");
    return;
  };

  const handleShowDetailCN = async () => {
    try {
      setShowCN(true);

      // Kiểm tra Câu hỏi trước
      const responseComplaints = await axios.get(
        `${API_BASE_URL}/statusLuong/complaintscn/${chiNgoai.id_dot}/${chiNgoai.id}`
      );
      console.log(responseComplaints.data);

      if (responseComplaints.data && responseComplaints.data.length > 0) {
        // Xử lý trường hợp có Câu hỏi
        const complaintData = responseComplaints.data[0];
        setComplaintSalaries(complaintData);
        setIsComplaint(true);
        // Thêm các state khác nếu cần
      } else {
        // Nếu không có Câu hỏi, tiếp tục với logic hiện tại
        const responseOutPage = await axios.get(
          `${API_BASE_URL}/statusLuong/out-pagecn/${chiNgoai.id_dot}/${chiNgoai.id}`
        );

        if (responseOutPage.data.length === 0) {
          const statusLuong = {
            id_trong: null,
            id_ngoai: chiNgoai.id,
            id_dot: chiNgoai.id_dot,
            time_con_lai: dotLuongNgoai.time_xem,
            tinh_trang: "Đang xem",
            last_modified: new Date().toISOString(),
          };

          await axios.post(`${API_BASE_URL}/statusLuong`, [statusLuong]);
        } else {
          setCountdownNgoai(responseOutPage.data[0].time_con_lai);
          console.log("Đã có bản ghi OutPage, không tạo mới.");
        }
      }

      setShowDetails(true);
      setIsRunning(true);
      startTimerNgoai();
    } catch (error) {
      console.error("Lỗi khi tạo hoặc cập nhật bản ghi status_luong:", error);
      alert("Có lỗi xảy ra khi bắt đầu xem chi tiết lương. Vui lòng thử lại.");
    }
  };

  const isWithinViewingPeriod = () => {
    const now = new Date();
    return now >= timeStart && now <= timeEnd;
  };

  const isWithinViewingPeriodNgoai = () => {
    const now = new Date();
    return now >= timeStartNgoai && now <= timeEndNgoai;
  };

  // Hàm định dạng số
  const formatNumber = (number) =>
    new Intl.NumberFormat("en-US").format(number); // Create a reusable function

  // Hiệu ứng Scroll Trang
  const [isCountdownFixed, setIsCountdownFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isCountdownFixed && window.scrollY > 220) {
        setIsCountdownFixed(true);
      } else if (isCountdownFixed && window.scrollY <= 100) {
        setIsCountdownFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCountdownFixed]);

  const [isShowSalaryCT, setIsShowSalaryCT] = useState(false);
  const [isShowSalaryCN, setIsShowSalaryCN] = useState(false);
  const handleShowSalary = () => {
    if (showCN) {
      setIsShowSalaryCN(true);
    } else {
      setIsShowSalaryCT(true);
    }
  };
  const renderSalaryCT = () => {
    if (!isWithinViewingPeriod()) {
      return (
        <div className="alert alert-warning text-center">
          Phiếu lương chỉ có thể xem từ{" "}
          {timeStartNgoai
            ? moment(timeStartNgoai).format("DD/MM/YYYY HH:mm:ss")
            : ""}{" "}
          đến{" "}
          {timeEndNgoai
            ? moment(timeEndNgoai).format("DD/MM/YYYY HH:mm:ss")
            : ""}
          .
        </div>
      );
    }
    return (
      <>
        {!showDetails ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-warning text-center">
                Mời bạn bấm vào <strong>"Xem lương"</strong> để xem chi tiết
                phiếu lương
              </div>
            </div>
            <div className="col-12 text-center">
              <button
                type="button"
                onClick={handleShowDetail}
                className="btn btn-primary"
              >
                Xem lương
              </button>
            </div>
          </div>
        ) : (
          <div className="card salary-details">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                BẢNG LƯƠNG CÁ NHÂN T{dotLuongTrong?.bang_luong_t}
              </h4>
              <p className="mb-0">
                Ngày thanh toán:{" "}
                {moment(dotLuongTrong?.ngay_thanh_toan).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className="card-body">
              <h5>Thông tin cá nhân</h5>
              <p>
                <strong>Họ tên:</strong> {chiTrong.ho_ten}
              </p>
              <p>
                <strong>Số thẻ:</strong> LH{chiTrong.ma_nv}
              </p>
              <p>
                <strong>Đơn vị:</strong> {chiTrong.to_in_luong}
              </p>
              <p>
                <strong>Mã số thuế:</strong> {chiTrong.ma_so_thue}
              </p>
              <button
                className="btn btn-primary mb-3"
                onClick={handleShowSalary}
              >
                Xem chi tiết lương
              </button>
              <table className="table table-striped">
                {isShowSalaryCT && (
                  <>
                    <h5>Chi tiết lương</h5>
                    <tbody>
                      <tr>
                        <td>Mức lương HĐLĐ:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.muc_luong_hd))}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ công thực tế:</td>
                        <td className="text-end">
                          {formatNumber(chiTrong.gio_cong_thuc_te)}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ công TT7/CB/CT:</td>
                        <td className="text-end">
                          {formatNumber(chiTrong.gio_cong_T7_CN_CT)}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ công giãn ca:</td>
                        <td className="text-end">
                          {formatNumber(chiTrong.gio_cong_ngay_thuong)}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ công ngày nghỉ:</td>
                        <td className="text-end">
                          {formatNumber(chiTrong.gio_cong_nghi)}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ công phép + Giờ công thời gian:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.gio_cong_phep_thoi_gian)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Giờ huấn luyện:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.gio_cong_huan_luyen))}
                        </td>
                      </tr>
                      <tr>
                        <td>Lương thời gian + lương phép:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.luong_tg_phep))}
                        </td>
                      </tr>
                      <tr>
                        <td>Lương trực tiếp:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.luong_truc_tiep))}
                        </td>
                      </tr>
                      <tr>
                        <td>Lương gián tiếp:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.luong_gian_tiep))}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp làm đêm:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.phu_cap_lam_dem))}
                        </td>
                      </tr>
                      <tr>
                        <td>Làm thêm ngày thường:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.luong_lam_them_ngay_thuong)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Làm thêm ngày nghỉ:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.luong_lam_them_ngay_nghi)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Thưởng kết quả sản xuất:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.thuong_kpi_san_xuat))}
                        </td>
                      </tr>
                      <tr>
                        <td>Thưởng CBCNV giỏi:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.thuong_cb_nv_gioi))}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp kiêm việc:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.phu_cap_kiem_viec))}
                        </td>
                      </tr>
                      <tr>
                        <td>Trợ cấp con nhỏ:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.phu_cap_con_nho))}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp đi lại, xăng xe:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.phu_cap_di_lai_xang_xe)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp tiền ăn:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.phu_cap_tien_an))}
                        </td>
                      </tr>
                      <tr>
                        <td>Thưởng HKTH tháng:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.thuong_hoan_thanh_kh_thang)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Thưởng HTKH ngày:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.thuong_hoan_thanh_kh_ngay)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>BS để tròn số đ/v chi TM:</td>
                        <td className="text-end">
                          {formatNumber(
                            Number(chiTrong.bo_sung_tron_so_chi_tien_mat)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Các khoản khác:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.cac_khoan_khac))}
                        </td>
                      </tr>
                      <tr>
                        <td>Lương tổng cộng:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.tong_cong))}
                        </td>
                      </tr>
                      <tr>
                        <td>Thuế thu nhập:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.thue_thu_nhap))}
                        </td>
                      </tr>
                      <tr>
                        <td>Bảo hiểm:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.bao_hiem))}
                        </td>
                      </tr>
                      <tr>
                        <td>Thu hồi phép:</td>
                        <td className="text-end">
                          {formatNumber(Number(chiTrong.thu_hoi_phep))}
                        </td>
                      </tr>
                    </tbody>
                  </>
                )}
                <tfoot>
                  <tr className="table-primary">
                    <th>Thực lãnh</th>
                    <th className="text-end">
                      {formatNumber(Number(chiTrong.thuc_lanh))}
                    </th>
                  </tr>
                </tfoot>
              </table>
              <div>
                {!showConfirmation && !showFeedbackForm && (
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      className="btn btn-success"
                      onClick={() => handlePauseAndAction(setShowConfirmation)}
                    >
                      Xác nhận phiếu lương
                    </button>
                    {!complaintSalaries && !isComplaint && (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handlePauseAndAction(setShowFeedbackForm)
                        }
                      >
                        Gửi câu hỏi
                      </button>
                    )}
                  </div>
                )}

                <div
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
                          {chiNgoai
                            ? "Bạn còn 1 bước nữa để xác nhận"
                            : "Bạn xác nhận những thông tin trong phiếu lương đã chính xác?"}
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-success"
                          onClick={() => handleConfirm("CT")}
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
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderSalaryCN = () => {
    if (!isWithinViewingPeriodNgoai()) {
      return (
        <div className="alert alert-warning text-center">
          Phiếu lương chỉ có thể xem từ{" "}
          {timeStartNgoai
            ? moment(timeStartNgoai).format("DD/MM/YYYY HH:mm:ss")
            : ""}{" "}
          đến{" "}
          {timeEndNgoai
            ? moment(timeEndNgoai).format("DD/MM/YYYY HH:mm:ss")
            : ""}
          .
        </div>
      );
    }
    return (
      <>
        {!showDetails ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-warning text-center">
                Mời bạn bấm vào <strong>"Xem lương"</strong> để xem chi tiết
                phiếu lương
              </div>
            </div>
            <div className="col-12 text-center">
              <button
                type="button"
                onClick={handleShowDetailCN}
                className="btn btn-primary"
              >
                Xem lương
              </button>
            </div>
          </div>
        ) : (
          <div className="card salary-details ">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                BẢNG LƯƠNG CÁ NHÂN T{dotLuongNgoai?.bang_luong_t}
              </h4>
              <p className="mb-0">
                Ngày thanh toán{" "}
                {moment(dotLuongNgoai?.ngay_thanh_toan).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className="card-body">
              <h5>Thông tin cá nhân</h5>
              <p>
                <strong>Họ tên:</strong> {chiNgoai.ho_ten}
              </p>
              <p>
                <strong>Số thẻ:</strong> LH{chiNgoai.ma_nv}
              </p>
              <button
                onClick={handleShowSalary}
                className="btn btn-primary mb-3"
              >
                Xem chi tiết lương
              </button>
              <table className="table table-striped">
                <tbody>
                  {isShowSalaryCN && (
                    <>
                      <h5 className="mt-4">Chi tiết lương</h5>
                      <tr>
                        <td>Gcgc:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.gio_cong_lam_them_nt)}
                        </td>
                      </tr>
                      <tr>
                        <td>Gcnn:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.gio_cong_lam_them_nn)}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp làm đêm:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.phu_cap_dem)}
                        </td>
                      </tr>
                      <tr>
                        <td>Làm thêm Ng. thường:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.lam_them_nt)}
                        </td>
                      </tr>
                      <tr>
                        <td>Làm thêm Ng. nghỉ:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.lam_them_nn)}
                        </td>
                      </tr>
                      <tr>
                        <td>Thưởng KQSX:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.thuong_ksnx_ngay_thuong)}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp đi lại, xăng xe:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.tien_xe)}
                        </td>
                      </tr>
                      <tr>
                        <td>Phụ cấp tiền ăn:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.tien_an)}
                        </td>
                      </tr>
                      <tr>
                        <td>BS để tròn số đ/v chi TM:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.bo_sung_so_cho_tien_mat)}
                        </td>
                      </tr>
                      <tr>
                        <td>Các khoản khác:</td>
                        <td className="text-end">
                          {formatNumber(chiNgoai.cac_khoan_khac)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th>Thực lãnh</th>
                    <th className="text-end">
                      {formatNumber(chiNgoai.tong_cong)}
                    </th>
                  </tr>
                </tfoot>
              </table>
              <div>
                {!showConfirmation && !showFeedbackForm && (
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      className="btn btn-success"
                      onClick={() => handlePauseAndAction(setShowConfirmation)}
                    >
                      Xác nhận phiếu lương
                    </button>
                    {!complaintSalaries && !isComplaint && (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handlePauseAndAction(setShowFeedbackForm)
                        }
                      >
                        Gửi câu hỏi
                      </button>
                    )}
                  </div>
                )}

                <div
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
                            handleResumeAndAction(setShowConfirmation, true)
                          }
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p>
                          Bạn xác nhận những thông tin trong phiếu lương đã
                          chính xác?
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-success"
                          onClick={() => handleConfirm("CN")}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleResumeAndAction(setShowConfirmation, true)
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
                            handleResumeAndAction(setShowFeedbackForm, true)
                          }
                        ></button>
                      </div>

                      <div className="modal-body">
                        <form onSubmit={handleFeedbackSubmitCN}>
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
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const getDisplayTime = () => {
    if (hiddenCountdown) {
      return formatTimeForDisplay(hiddenCountdown);
    } else {
      return formatTimeForDisplay(pausedTimes);
    }
  };

  const formatTimeForDisplay = (time) => {
    let hours, minutes, seconds;
    if (typeof time === "number") {
      // Nếu time là số giây (hiddenCountdown)
      hours = Math.floor(time / 3600);
      minutes = Math.floor((time % 3600) / 60);
      seconds = time % 60;
    } else if (typeof time === "string") {
      // Nếu time là chuỗi "HH:MM:SS" (pausedTimes)
      [hours, minutes, seconds] = time.split(":").map(Number);
    } else {
      console.error("Invalid time format:", time);
      return "Không xác định";
    }

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error)
    return (
      <div class="alert alert-warning" role="alert">
        Bạn chưa có phiếu lương (Liên hệ phòng nhân sự để biết thêm thông tin)
      </div>
    );
  if (!chiTrong && !chiNgoai)
    return (
      <div className="alert alert-warning" role="alert">
        Không có dữ liệu lương
      </div>
    );

  return (
    <div className="container-fluid mt-4">
      {/* Modal Thời gian xem lương */}
      <Modal show={showTimeWarning} onHide={handleCloseWarning}>
        <Modal.Header closeButton>
          <Modal.Title>Cảnh báo thời gian</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn còn <strong>{getDisplayTime()}</strong> để xem phiếu lương
          {showGiaHan && " Bạn cần thêm thời gian để xác nhận phiếu lương"}
        </Modal.Body>
        <Modal.Footer>
          {showGiaHan && (
            <Button variant="primary" onClick={handleGiaHan}>
              Có
            </Button>
          )}
          <Button variant="primary" onClick={handleCloseWarning}>
            {showGiaHan ? "Không" : "Ẩn đồng hồ"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal Xác nhận gửi câu hỏi */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isConfirming ? "Xác nhận gửi câu hỏi" : "Thông báo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isConfirming ? (
            "Bạn có chắc chắn muốn gửi câu hỏi này không?"
          ) : (
            <>
              <FaCheck className="me-2 text-success" /> Bạn đã gửi câu hỏi thành
              công!
              <br />
              Phòng Nhân sự sẽ liên hệ cho bạn để phản hồi thông tin.
              {!showCN &&
                chiNgoai &&
                " Bạn còn một phiếu lương nữa để xác nhận."}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isConfirming ? (
            <>
              <Button variant="secondary" onClick={handleModalClose}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={confirmSubmit}
                disabled={isSending}
              >
                {isSending ? "Đang gửi..." : "Gửi"}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleModalClose}>
              OK
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      {showSuccessMessage ? (
        message === "Bạn đã xác nhận phiếu lương thành công!" ? (
          <>
            <div className="text-center my-5">
              <FcOk size={100} className="me-2" />
              <h3 className="mt-3">{message}</h3>
            </div>
          </>
        ) : (
          <>
            <div className="text-center my-5">
              <FcFeedback size={100} className="me-2" />
              <h3 className="mt-3">
                {message} Phòng Nhân sự sẽ liên hệ cho bạn để phản hồi thông
                tin.
              </h3>
            </div>
          </>
        )
      ) : (
        <>
          {!chiTrong && chiNgoai && isWithinViewingPeriodNgoai() ? (
            renderSalaryCN()
          ) : !hasCTViewed ? (
            isWithinViewingPeriod() ? (
              renderSalaryCT()
            ) : (
              <div className="alert alert-warning text-center">
                Phiếu lương chỉ có thể xem từ{" "}
                {moment(timeStart).format("DD/MM/YYYY HH:mm")} đến{" "}
                {moment(timeEnd).format("DD/MM/YYYY HH:mm")}.
              </div>
            )
          ) : (
            chiNgoai &&
            (isWithinViewingPeriodNgoai() ? (
              renderSalaryCN()
            ) : (
              <div className="alert alert-warning text-center">
                Phiếu lương chỉ có thể xem từ{" "}
                {moment(timeStartNgoai).format("DD/MM/YYYY HH:mm")} đến{" "}
                {moment(timeEndNgoai).format("DD/MM/YYYY HH:mm")}.
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default SalaryDetails;
