import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { API_BASE_URL } from "../../config/api";
import { FaCheck } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { FcFeedback, FcOk } from "react-icons/fc";
import { getDaysInMonth, formatNumber } from "../../utils";

const WorkHourDetails = () => {
  const [dateInput, setDateInput] = useState(""); // Chuỗi chứa tháng và năm
  const [feedback, setFeedback] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [HST, setHST] = useState(null);
  const [GCGC, setGCGC] = useState(null);
  const [mainWorkHours, setMainWorkHours] = useState(null);
  // GCGC = GCGC
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dotLuongTrong, setDotCongHST] = useState(null);
  const [dotLuongNgoai, setDotCongGCGC] = useState(null);
  const [dotCongMain, setDotCongMain] = useState(null);
  const [countdownHST, setCountdownHST] = useState(null); // Khởi tạo countdown
  const [countdownGCGC, setCountdownGCGC] = useState(null); // Khởi tạo countdown
  const [countdownMain, setCountdownMain] = useState(null); // Khởi tạo countdown

  const [showDetails, setShowDetails] = useState(false); // Trạng thái để điều khiển hiển thị chi tiết
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState(null);
  // Thêm state mới để lưu trữ các khoảng thời gian đã dừng
  const [pausedTimes, setPausedTimes] = useState([]);
  const intervalRef = useRef(null);
  const [showGCGC, setShowGCGC] = useState(false);
  const [timeStart, setTimeStart] = useState(null);
  const [timeEnd, setTimeEnd] = useState(null);
  const [timeStartNgoai, setTimeStartGCGC] = useState(null);
  const [timeEndNgoai, setTimeEndGCGC] = useState(null);

  const [timeStarMain, setTimeStartMain] = useState(null);
  const [timeEndMain, setTimeEndMain] = useState(null);
  const [hasCTViewed, setHasCTViewed] = useState(false);

  const ma_nv = localStorage.getItem("ma_nv");

  const days = Array.from(
    { length: getDaysInMonth(dateInput) },
    (_, i) => i + 1
  );
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch HST data
        const fetchHST = async () => {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/dotcong/active-he-so-thuong-sp/${ma_nv}`,
              moment(new Date()).format("MM-YYYY")
            );
            if (response.data && response.data.length > 0) {
              const HST = response.data[0];
              setHST(HST);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${HST.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              setDotCongHST(dotCong);
              setCountdownHST(dotCong.time_xem);
              setTimeStart(new Date(dotCong.time_start));
              setTimeEnd(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu HST:", error);
            setHST(null);
            setDotCongHST(null);
          }
        };

        // Fetch GCGC data
        const fetchGCGC = async () => {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/dotcong/active-gio-cong-gian-ca-sp/${ma_nv}`,
              moment(new Date()).format("MM-YYYY")
            );
            if (response.data && response.data.length > 0) {
              console.log(response.data);
              const GCGC = response.data[0];
              setGCGC(GCGC);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${GCGC.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              setDotCongGCGC(dotCong);
              setCountdownGCGC(dotCong.time_xem);
              setTimeStartGCGC(new Date(dotCong.time_start));
              setTimeEndGCGC(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu GCGC:", error);
            setGCGC(null);
            setDotCongGCGC(null);
            setCountdownGCGC(null);
          }
        };

        const fetchMain = async () => {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/dotcong/active-cong-main-sp/${ma_nv}`,
              moment(new Date()).format("MM-YYYY")
            );
            if (response.data && response.data.length > 0) {
              console.log(response.data);
              const Main = response.data[0];
              setMainWorkHours(Main);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${Main.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              // setDotCongGCGC(dotCong);
              setDotCongMain(dotCong);

              // setCountdownGCGC(dotCong.time_xem);
              setCountdownMain(dotCong.time_xem);
              setTimeStartMain(new Date(dotCong.time_start));
              setTimeEndMain(new Date(dotCong.time_end));
              // setTimeStartGCGC(new Date(dotCong.time_start));
              // setTimeEndGCGC(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Bảng công chính:", error);
            setMainWorkHours(null);
            setDotCongMain(null);
            setCountdownMain(null);
          }
        };

        // Thực hiện cả hai fetch cùng lúc
        await Promise.all([fetchHST(), fetchGCGC(), fetchMain()]);

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

  //xác nhận
  const handleConfirm = useCallback(
    async (phieuType) => {
      const isCT = phieuType === "HST";
      const currentDotCong = isCT ? HST : GCGC;

      if (!currentDotCong) {
        console.error("Không tìm thấy dữ liệu công");
        alert("Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.");
        return;
      }

      const statusLuong = {
        id_he_so_thuong: isCT ? currentDotCong.id : null,
        id_gio_cong_gian_ca: isCT ? null : currentDotCong.id,
        id_dot: currentDotCong.id_dot_cong,
        time_con_lai: pausedTimes,
        tinh_trang: isComplaint ? "Câu hỏi" : "Đã xác nhận",
        ...(isComplaint && { tinh_trang_nld_khieu_nai: "Đã xác nhận" }),
      };

      try {
        await axios.post(`${API_BASE_URL}/statusCong`, [statusLuong]);
        setShowConfirmation(false);

        if (isCT && GCGC) {
          setHasCTViewed(true);
          setShowGCGC(true);
          setIsRunning(true);
          startTimerGCGC();
        } else {
          setShowSuccessMessage(true);
          setMessage("Bạn đã xác nhận phiếu công thành công!");
          setShowDetails(false);
          if (isCT) setShowGCGC(false);
        }
      } catch (error) {
        console.error("Lỗi khi xác nhận:", error);
        alert("Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.");
      }
    },
    [HST, GCGC, mainWorkHours, pausedTimes, API_BASE_URL]
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
      id_he_so_thuong: !showGCGC ? HST.id : null,
      id_gio_cong_gian_ca: showGCGC ? GCGC.id : null,
      id_dot: !showGCGC ? HST.id_dot_cong : GCGC.id_dot_cong,
      time_con_lai: pausedTimes,
      tinh_trang: "Câu hỏi",
      noi_dung_kn: feedbackString,
      last_modified: new Date(),
    };
    try {
      await axios.post(`${API_BASE_URL}/statusCong`, [statusLuong]);
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
      if (!showGCGC && GCGC) {
        setHasCTViewed(true);
        setShowGCGC(true);
        setIsRunning(true);
        startTimerGCGC();
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

  // Thoát trang
  useEffect(() => {
    console.log("pausedTimes", +1);
    const handleBeforeUnload = async (event) => {
      updateRemainingTime(); // Cập nhật thời gian còn lại ngay trước khi unload

      if (showDetails && !showSuccessMessage && inFormOrLink) {
        event.preventDefault();
        event.returnValue = "Do you really want to close?"; // For modern browsers

        // Đặt một biến trạng thái để gửi dữ liệu
        const statusCong = {
          id_he_so_thuong: !showGCGC ? HST.id : null,
          id_gio_cong_gian_ca: showGCGC ? GCGC.id : null,
          id_dot: !showGCGC ? HST.id_dot : GCGC.id_dot,
          time_con_lai: pausedTimes,
          tinh_trang: isComplaint ? "Câu hỏi" : "Tắt trang",
          tinh_trang_nld_khieu_nai: isComplaint ? "Đã xác nhận" : "",
          last_modified: new Date(),
        };

        // Gửi dữ liệu khi người dùng thực sự rời khỏi trang
        const sendData = async () => {
          try {
            await axios.post(`${API_BASE_URL}/statusCong`, [statusCong]);
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
    HST,
    GCGC,
    pausedTimes,
    showGCGC,
  ]);

  // Đã tối ưu
  const handlePauseAndAction = (action, isForGCGC = false) => {
    handleTimerAction("pause", isForGCGC);
    action(true);
  };

  const handleResumeAndAction = (action, isForGCGC = false) => {
    handleTimerAction("resume", isForGCGC);
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

    const idHSTGCGC = !showGCGC ? HST?.id : GCGC?.id;
    const idDot = !showGCGC ? HST?.id_dot_cong : GCGC?.id_dot_cong;

    try {
      const timeGiaHan = await axios.get(
        `${API_BASE_URL}/statusCong/check-extension/${idHSTGCGC}/${idDot}`
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
      const idHSTGCGC = !showGCGC ? HST.id : GCGC.id;
      const idDot = !showGCGC ? HST.id_dot_cong : GCGC.id_dot_cong;

      await axios.put(
        `${API_BASE_URL}/statuscong/update-status-cong-xin-gia-han/${idHSTGCGC}/${idDot}`,
        {
          xin_gia_han: false,
        }
      );

      const currentTime = showGCGC ? countdownGCGC : countdownHST;
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
          if (showGCGC) {
            setCountdownGCGC(newTime);
            startTimerGCGC();
          } else {
            setCountdownHST(newTime);
            startTimerHST();
          }
          return null;
        }
      });
    }, 1000);
  };

  const handleCloseWarning = () => {
    setShowTimeWarning(false);
    if (showGCGC) {
      setCountdownGCGC(pausedTimes);
      startTimerGCGC();
    } else {
      setCountdownHST(pausedTimes);
      startTimerHST();
    }
  };

  const updateRemainingTime = useCallback(() => {
    if (isRunning) {
      const currentTime = !showGCGC ? countdownHST : countdownGCGC;
      setPausedTimes(currentTime);
    }
  }, [isRunning, showGCGC, countdownHST, countdownGCGC]);

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

  const startTimerHST = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hiddenCountdown) return;

      setCountdownHST((prevCountdown) => {
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

  const startTimerGCGC = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    intervalRef.current = setInterval(() => {
      if (hiddenCountdown) return;

      setCountdownGCGC((prevCountdown) => {
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

    const statusCong = {
      id_he_so_thuong: isNgoai ? null : HST.id,
      id_gio_cong_gian_ca: isNgoai ? GCGC.id : null,
      id_dot: isNgoai ? GCGC.id_dot_cong : HST.id_dot_cong,
      time_con_lai: "00:00:00",
      tinh_trang: isComplaint ? "Câu hỏi" : "Hết giờ",
      tinh_trang_nld_khieu_nai: isComplaint ? "Đã xác nhận" : "",
    };

    try {
      await axios.post(`${API_BASE_URL}/statusCong`, [statusCong]);
      setShowDetails(false);
      setShowSuccessMessage(true);
      setMessage("Bạn đã hết thời gian xem phiếu công!");
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

  const handleTimerAction = (action, isForGCGC = false) => {
    if (action === "pause") {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setPausedTimes(isForGCGC ? countdownGCGC : countdownHST);
    } else if (action === "resume") {
      setIsRunning(true);
      if (isForGCGC) {
        startTimerGCGC();
      } else {
        startTimerHST();
      }
    }
  };

  const [complaintDotCongs, setComplaintDotCongs] = useState(null);
  const [isComplaint, setIsComplaint] = useState(false);

  const handleShowDetail = async () => {
    try {
      const isCT = Boolean(HST);
      const currentDotCong = isCT ? HST : GCGC;
      const currentDotLuong = isCT ? dotLuongTrong : dotLuongNgoai;

      if (!currentDotCong) {
        throw new Error("Không có dữ liệu công để hiển thị");
      }

      setShowGCGC(!isCT);

      // Kiểm tra Câu hỏi
      const complaintEndpoint = isCT ? "complaints" : "complaintsgcgc";
      const { data: complaints } = await axios.get(
        `${API_BASE_URL}/statusCong/${complaintEndpoint}/${currentDotCong.id_dot}/${currentDotCong.id}`
      );
      if (complaints && complaints.length > 0) {
        setComplaintDotCongs(complaints[0]);
        setIsComplaint(true);
      } else {
        // Nếu không có Câu hỏi, kiểm tra và cập nhật trạng thái xem
        const outPageEndpoint = isCT ? "out-page" : "out-pagegcgc";
        const { data: outPageData } = await axios.get(
          `${API_BASE_URL}/statusCong/${outPageEndpoint}/${currentDotCong.id_dot}/${currentDotCong.id}`
        );

        if (outPageData.length === 0) {
          const statusLuong = {
            id_he_so_thuong: isCT ? currentDotCong.id : null,
            id_gio_cong_gian_ca: isCT ? null : currentDotCong.id,
            id_dot: currentDotCong.id_dot_cong,
            time_con_lai: currentDotLuong.time_xem,
            tinh_trang: "Đang xem",
            last_modified: new Date().toISOString(),
          };

          await axios.post(`${API_BASE_URL}/statusCong`, [statusLuong]);
        } else {
          isCT
            ? setCountdownHST(outPageData[0].time_con_lai)
            : setCountdownGCGC(outPageData[0].time_con_lai);
          console.log("Đã có bản ghi OutPage, không tạo mới.");
        }
      }

      setShowDetails(true);
      setIsRunning(true);
      isCT ? startTimerHST() : startTimerGCGC();
    } catch (error) {
      console.error("Lỗi khi xử lý chi tiết công:", error);
      alert("Có lỗi xảy ra khi bắt đầu xem chi tiết công. Vui lòng thử lại.");
    }
  };
  // GCGC
  const handleFeedbackSubmitGCGC = async (e) => {
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

    const statusCong = {
      id_gio_cong_gian_ca: GCGC.id,
      id_dot: GCGC.id_dot,
      time_con_lai: pausedTimes,
      tinh_trang: "Câu hỏi",
      noi_dung_kn: feedbackString,
    };
    await axios.post(`${API_BASE_URL}/statusCong`, [statusCong]);
    setFeedback("");
    setSelectedOptions([]);
    setShowFeedbackForm(false);
    setShowSuccessMessage(true); // Thêm dòng này để hiển thị thông báo thành công
    setShowDetails(false); // Ẩn chi tiết lương nếu cần
    setMessage("Bạn đã gửi câu hỏi thành công!");
    return;
  };

  const handleShowDetailGCGC = async () => {
    try {
      setShowGCGC(true);

      // Kiểm tra Câu hỏi trước
      const responseComplaints = await axios.get(
        `${API_BASE_URL}/statusCong/complaintsgcgc/${GCGC.id_dot_cong}/${GCGC.id}`
      );
      console.log("responseComplaintsGCGC", responseComplaints.data);

      if (responseComplaints.data && responseComplaints.data.length > 0) {
        // Xử lý trường hợp có Câu hỏi
        const complaintData = responseComplaints.data[0];
        setComplaintDotCongs(complaintData);
        setIsComplaint(true);
        // Thêm các state khác nếu cần
      } else {
        // Nếu không có Câu hỏi, tiếp tục với logic hiện tại
        const responseOutPage = await axios.get(
          `${API_BASE_URL}/statusCong/out-pagegcgc/${GCGC.id_dot_cong}/${GCGC.id}`
        );

        if (responseOutPage.data.length === 0) {
          const statusCong = {
            id_he_so_thuong: null,
            id_gio_cong_gian_ca: GCGC.id,
            id_dot: GCGC.id_dot_cong,
            time_con_lai: dotLuongNgoai.time_xem,
            tinh_trang: "Đang xem",
            last_modified: new Date().toISOString(),
          };

          await axios.post(`${API_BASE_URL}/statusCong`, [statusCong]);
        } else {
          setCountdownGCGC(responseOutPage.data[0].time_con_lai);
          console.log("Đã có bản ghi OutPage, không tạo mới.");
        }
      }

      setShowDetails(true);
      setIsRunning(true);
      startTimerGCGC();
    } catch (error) {
      console.error("Lỗi khi tạo hoặc cập nhật bản ghi status_Cuong:", error);
      alert("Có lỗi xảy ra khi bắt đầu xem chi tiết Công. Vui lòng thử lại.");
    }
  };

  const isWithinViewingPeriod = () => {
    const now = new Date();
    return now >= timeStart && now <= timeEnd;
  };

  const isWithinViewingPeriodGCGC = () => {
    const now = new Date();
    return now >= timeStartNgoai && now <= timeEndNgoai;
  };

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

  const [isShowDotCongHST, setIsShowDotCongHST] = useState(false);
  const [isShowDotCongGCGC, setIsShowDotCongGCGC] = useState(false);
  const handleShowSalary = () => {
    if (showGCGC) {
      setIsShowDotCongGCGC(true);
    } else {
      setIsShowDotCongHST(true);
    }
  };
  const renderSalaryHST = () => {
    if (!isWithinViewingPeriod()) {
      return (
        <div className="alert alert-warning text-center">
          Phiếu công chỉ có thể xem từ{" "}
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
                Mời bạn bấm vào <strong>"Xem công"</strong> để xem chi tiết
                phiếu công
              </div>
            </div>
            <div className="col-12 text-center">
              <button
                type="button"
                onClick={handleShowDetail}
                className="btn btn-primary"
              >
                Xem công
              </button>
            </div>
          </div>
        ) : (
          <div className="card salary-details">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                BẢNG CÔNG CÁ NHÂN T{dotLuongTrong?.bang_cong_t}
              </h4>
            </div>
            <div className="card-body">
              <h5 className="mb-3">Thông tin cá nhân</h5>
              <p>
                <strong>Họ tên:</strong> {HST.ho} {HST.ten}
              </p>
              <p>
                <strong>Số thẻ:</strong> LH{HST.so_the}
              </p>
              <p>
                <strong>Tổ:</strong> {HST.f_To}
              </p>

              <button
                className="btn btn-primary mb-3"
                onClick={handleShowSalary}
              >
                Xem chi tiết công
              </button>
              {isShowDotCongHST ? (
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
                            {formatNumber(HST.cot1)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot2)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot3)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot4)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot5)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot6)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot7)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot8)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot9)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot10)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot11)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot12)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot13)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot14)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot15)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot16)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot17)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot18)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot19)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot20)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot21)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot22)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot23)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot24)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot25)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot26)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot27)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot28)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot29)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot30)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.cot31)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.vpcl)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.vpkl)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.o)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.hsbq)}
                          </td>
                          <td className="text-center white-space borderRight">
                            {formatNumber(HST.hsbqthg)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <></>
              )}

              <div>
                {!showConfirmation && !showFeedbackForm && (
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
                          {GCGC
                            ? "Bạn còn 1 bước nữa để xác nhận"
                            : "Bạn xác nhận những thông tin trong phiếu công đã chính xác?"}
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-success"
                          onClick={() => handleConfirm("HST")}
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

  const renderSalaryGCGC = () => {
    if (!isWithinViewingPeriodGCGC()) {
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
                Mời bạn bấm vào <strong>"Xem công"</strong> để xem chi tiết
                phiếu công
              </div>
            </div>
            <div className="col-12 text-center">
              <button
                type="button"
                onClick={handleShowDetailGCGC}
                className="btn btn-primary"
              >
                Xem công
              </button>
            </div>
          </div>
        ) : (
          <div className="card salary-details ">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                BẢNG CÔNG CÁ NHÂN T{dotLuongNgoai?.bang_cong_t}
              </h4>
            </div>
            <div className="card-body">
              <h5 className="mb-3">Thông tin cá nhân</h5>
              <p>
                <strong>Họ tên:</strong> {GCGC.ho} {GCGC.ten}
              </p>
              <p>
                <strong>Số thẻ:</strong> LH{GCGC.so_the}
              </p>
              <button
                onClick={handleShowSalary}
                className="btn btn-primary mb-3"
              >
                Xem chi tiết công
              </button>
              {isShowDotCongGCGC ? (
                <>
                  <h5 className="mb-3">Giờ công giãn ca</h5>
                  <div className="overflow-x-scroll">
                    <table
                      className="table table-striped "
                      style={{ tableLayout: "auto", width: "100%" }}
                    >
                      <thead>
                        <tr>
                          <th className="white-space text-center dotcongTh borderRight">
                            Hành chính + Ca1 + Ca2
                          </th>
                          <th className="white-space text-center dotcongTh borderRight">
                            Ca3
                          </th>
                          <th className="white-space text-center dotcongTh borderRight">
                            Ngày thường
                          </th>
                          <th className="white-space text-center dotcongTh borderRight">
                            Ngày nghỉ hàng tuần
                          </th>
                          <th className="white-space text-center dotcongTh borderRight">
                            Ngày lễ
                          </th>
                          <th className="white-space text-center dotcongTh borderRight">
                            Phép
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.hanh_Chinh_Ca)}
                          </td>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.ca3)}
                          </td>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.ngay_Thuong)}
                          </td>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.ngay_Nghi_Hang_Tuan)}
                          </td>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.ngay_Le)}
                          </td>
                          <td className="white-space text-center dotcongTh borderRight">
                            {formatNumber(GCGC.phep)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <></>
              )}

              <div>
                {!showConfirmation && !showFeedbackForm && (
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
                          Bạn xác nhận những thông tin trong phiếu công đã chính
                          xác?
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
                        <form onSubmit={handleFeedbackSubmitGCGC}>
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
        Bạn chưa có phiếu công (Liên hệ phòng nhân sự để biết thêm thông tin)
      </div>
    );
  if (!HST && !GCGC)
    return (
      <div className="alert alert-warning" role="alert">
        Không có dữ liệu công
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
          Bạn còn <strong>{getDisplayTime()}</strong> để xem phiếu công
          {showGiaHan && " Bạn cần thêm thời gian để xác nhận phiếu công"}
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
              {!showGCGC && GCGC && " Bạn còn một phiếu công nữa để xác nhận."}
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
        message === "Bạn đã xác nhận phiếu công thành công!" ? (
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
          {!HST && GCGC && isWithinViewingPeriodGCGC() ? (
            renderSalaryGCGC()
          ) : !hasCTViewed ? (
            isWithinViewingPeriod() ? (
              renderSalaryHST()
            ) : (
              <div className="alert alert-warning text-center">
                Phiếu công chỉ có thể xem từ{" "}
                {moment(timeStart).format("DD/MM/YYYY HH:mm")} đến{" "}
                {moment(timeEnd).format("DD/MM/YYYY HH:mm")}.
              </div>
            )
          ) : (
            GCGC &&
            (isWithinViewingPeriodGCGC() ? (
              renderSalaryGCGC()
            ) : (
              <div className="alert alert-warning text-center">
                Phiếu công chỉ có thể xem từ{" "}
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

export default WorkHourDetails;
