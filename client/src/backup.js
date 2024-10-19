// server Socket Login
io.on("connection", (socket) => {
  console.log("running...");

  socket.on("login", async (data) => {
    const { MaNV, MatKhau } = data;

    try {
      const [rows] = await connection.query(
        `SELECT DISTINCT * FROM sync_nhan_vien WHERE ma_nv = ? `,
        [MaNV]
      );

      const isMatch = await bcrypt.compare(MatKhau, rows[0].mat_khau);

      if (!isMatch) {
        return socket.emit("login_failed", {
          message: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }
      // Kiểm tra xem có người dùng nào được tìm thấy không
      if (rows.length > 0) {
        const user = rows[0]; // Lấy người dùng đầu tiên

        // Xác định vai trò dựa trên id_bo_phan
        const role = user.id_bo_phan === 76 ? "admin" : "user";
        const roleAll = user.id_phong_ban_phu_trach
          ? "QL"
          : user.id_bo_phan_phu_trach
          ? "TT"
          : "user";
        // Tạo token JWT với thông tin vai trò
        const token = jwt.sign(
          {
            id: user.id,
            ma_nv: user.ma_nv,
            role: role,
            roleAll: roleAll,
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        if (socket.id) {
          console.log("phienlogin", phienlogin);
          const previousSocketId = phienlogin[MaNV];
          io.to(previousSocketId).emit("force_logout", {
            message: "Bạn đã đăng nhập ở thiết bị khác, bạn sẽ bị đăng xuất.",
          });

          io.sockets.sockets.get(previousSocketId)?.disconnect(true);
        }
        phienlogin[MaNV] = socket.id;

        // Gửi phản hồi đăng nhập thành công
        socket.emit("login_success", {
          message: "Đăng nhập thành công",
          data: {
            user: {
              ten_nv: user.ten_nv,
              ma_nv: user.ma_nv,
              id: user.id,
              id_bo_phan: user.id_bo_phan,
              role: role,
              roleAll: roleAll,
            },
            token,
            phienlogin,
          },
        });
      } else {
        socket.emit("login_failed", {
          message: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      socket.emit("login_failed", {
        message: "Đã xảy ra lỗi trong quá trình đăng nhập.",
      });
    }
  });

  // Thêm sự kiện logout
  socket.on("logout", () => {
    console.log(`User ${socket.id} logged out.`);
    for (let MaNV in phienlogin) {
      if (phienlogin[MaNV] === socket.id) {
        delete phienlogin[MaNV];
        break;
      }
    }
    socket.emit("logout_success", {
      message: "Đăng xuất thành công.",
    });
  });

  // Khi ngắt kết nối
  socket.on("disconnect", () => {
    console.log("disconnect...");
    for (let MaNV in phienlogin) {
      if (phienlogin[MaNV] === socket.id) {
        delete phienlogin[MaNV];
        break;
      }
    }
  });
});

useEffect(() => {
  const handleBeforeUnload = (event) => {
    // Cancel the event to show a confirmation dialog
    event.preventDefault();
    event.returnValue = ""; // Standard way to show confirmation dialog

    // Save status to local storage (or session storage) for later processing
    const statusLuong = {
      id_trong: chiTrong.id,
      id_dot: chiTrong.id_dot,
      time_con_lai: pausedTimes,
      tinh_trang: "",
    };
    localStorage.setItem("statusLuong", JSON.stringify(statusLuong));

    // Note: Modern browsers often ignore custom messages
    return ""; // Return empty string to trigger the confirmation dialog
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [chiTrong.id, chiTrong.id_dot, pausedTimes]);

// In a useEffect hook or similar place, handle the saved data
useEffect(() => {
  const savedStatusLuong = localStorage.getItem("statusLuong");
  if (savedStatusLuong) {
    const statusLuong = JSON.parse(savedStatusLuong);

    // Send the saved data to the server
    axios
      .post("http://localhost:30210/api/statusLuong", [statusLuong])
      .then((response) => {
        console.log("Dữ liệu đã được gửi:", response.data);
        // Clear local storage after successful send
        localStorage.removeItem("statusLuong");
      })
      .catch((error) => {
        console.error("Lỗi khi gửi dữ liệu:", error);
      });
  }
}, []); // Empty dependency array means this effect runs only once on mount

useEffect(() => {
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = "Bạn có chắc chắn muốn rời trang này?";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);

const handleResumeAndFeedbackCN = () => {
  handleResumeCN();
  setShowFeedbackForm(false);
};

const handlePauseAndFeedbackCN = () => {
  handlePauseCN();
  setShowFeedbackForm(true);
};

const handleResumeAndConfirmationCN = () => {
  handleResumeCN();
  setShowConfirmation(false);
};
const handlePauseAndConfirmationCN = () => {
  handlePauseCN();
  setShowConfirmation(true);
};

const handleResumeAndFeedback = () => {
  handleResume();
  setShowFeedbackForm(false);
};

const handlePauseAndFeedback = () => {
  handlePause();
  setShowFeedbackForm(true);
};

const handleResumeAndConfirmation = () => {
  handleResume();
  setShowConfirmation(false);
};
const handlePauseAndConfirmation = () => {
  handlePause();
  setShowConfirmation(true);
};

const handlePauseCN = () => {
  clearInterval(intervalRef.current);
  setIsRunning(false);

  // Lưu thời gian hiện tại khi dừng
  setPausedTimes(countdownNgoai);
};
const handleResumeCN = () => {
  setIsRunning(true);
  startTimerNgoai();
};

const handleConfirmCN = (e) => {
  e.preventDefault();
  const statusLuong = {
    id_ngoai: chiNgoai.id,
    id_dot: chiNgoai.id_dot,
    time_con_lai: pausedTimes,
    tinh_trang: "Đã xác nhận",
  };
  const responseStatus = axios.post(`${API_BASE_URL}/statusLuong`, [
    statusLuong,
  ]);
  setShowConfirmation(false);
  setShowDetails(false);
};

const handlePause = () => {
  clearInterval(intervalRef.current);
  setIsRunning(false);

  // Lưu thời gian hiện tại khi dừng
  setPausedTimes(countdownTrong);
};
const handleResume = () => {
  setIsRunning(true);
  startTimerTrong();
};

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [chiTrongResponse, chiNgoaiResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/chitrong/salary/${ma_nv}`),
        axios.get(`${API_BASE_URL}/chingoai/salary/${ma_nv}`),
      ]);

      // Xử lý dữ liệu Chi Trong
      if (chiTrongResponse.data) {
        setChiTrong(chiTrongResponse.data);
        const dotLuongTrongResponse = await axios.get(
          `${API_BASE_URL}/dotluong/${chiTrongResponse.data.id_dot}`
        );
        setDotLuongTrong(dotLuongTrongResponse.data);
        setCountdownTrong(dotLuongTrongResponse.data.time_xem);
      }

      // Xử lý dữ liệu Chi Ngoai
      if (chiNgoaiResponse.data) {
        setChiNgoai(chiNgoaiResponse.data);
        const dotLuongNgoaiResponse = await axios.get(
          `${API_BASE_URL}/dotluong/${chiNgoaiResponse.data.id_dot}`
        );
        setDotLuongNgoai(dotLuongNgoaiResponse.data);
        setCountdownNgoai(dotLuongNgoaiResponse.data.time_xem);
      } else {
        setChiNgoai(null);
        setDotLuongNgoai(null);
        setCountdownNgoai(null);
      }

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setError("Không thể lấy dữ liệu lương");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [ma_nv]);
// Fetch Data đợt lương
useEffect(() => {
  const fetchData = async () => {
    // Lấy dữ liệu đợt lương bằng tháng
    const DotLuong = async () => {
      if (updateSalaryData.month) {
        try {
          const formattedMonth = moment(updateSalaryData.month).format(
            "MM-YYYY"
          );
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
    // Lấy dữ liệu đợt lương bằng tên đợt
    const DotLuongByName = async () => {
      const periodName = updateSalaryData.periodName;
      if (!periodName) return null;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/dotluong/periodName/${periodName}`
        );
        setIsDotLuong(response.data);
        return response.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
        setIsDotLuong([]);
        return null;
      }
    };
    // Lấy dữ liệu đợt lương bằng id doi
    const isDotLuongByIdDot = () => {
      if (updateSalaryData.templateName === "1") {
        console.log("1", updateSalaryData.templateName === "1");
        if (isDotLuong.id) {
          try {
            const response = axios.get(
              `${API_BASE_URL}/chitrong/id_dot/${isDotLuong.id}`
            );
            setIsLuongByIdDotCT(response.data);
            //  console.log(response.data);
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
            setIsLuongByIdDotCT([]);
          }
        } else {
          setIsLuongByIdDotCT([]);
        }
      } else if (updateSalaryData.templateName === "2") {
        console.log("2", updateSalaryData.templateName === "2");
        if (isDotLuong.id) {
          try {
            const response = axios.get(
              `${API_BASE_URL}/chingoai/id_dot/${isDotLuong.id}`
            );
            setIsLuongByIdDotCN(response.data);
            //  console.log(response.data);
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
            setIsLuongByIdDotCN([]);
          }
        } else {
          setIsLuongByIdDotCN([]);
        }
      }
    };

    // Thực hiện cả hai fetch cùng lúc
    await Promise.all([DotLuong(), DotLuongByName(), isDotLuongByIdDot()]);
  };
  fetchData();
}, [updateSalaryData.month, updateSalaryData.periodName, API_BASE_URL]);

// Hàm gọi API để lưu dữ liệu
const updateDataToDB = async (templateType, data, id_dot) => {
  console.log("data", data);
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data format:", data);
    throw new Error("Data must be a non-empty array");
  }
  if (!id_dot) {
    console.error("Missing id_dot");
    throw new Error("id_dot is required");
  }

  console.log("Sending data to server:", { dataLength: data.length, id_dot });
  const endpoint =
    templateType === "1" ? "chitrong/savechitrong" : "chingoai/savechingoai";
  const response = await axios.put(`${API_BASE_URL}/${endpoint}`, {
    data,
    id_dot,
  });
  return response;
};
