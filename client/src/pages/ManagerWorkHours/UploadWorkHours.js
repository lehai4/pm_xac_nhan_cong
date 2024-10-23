import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { RangeDateTimePicker } from "../../components/DatePickerComponents";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { API_BASE_URL } from "../../config/api";
import axios from "axios";
import moment from "moment";
import PhongbanPhanquyenWorkHours from "../../components/PhongbanPhanquyenWorkHours";

const UploadWorkHours = () => {
  let [maxViewTime, setMaxViewTime] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [dotCong, setDotCong] = useState([]); //Lấy theo tháng
  const [isDotCong, setIsDotCong] = useState([]); //Lấy theo tên đợt
  const [isCongByIdDotHST, setIsCongByIdDotHST] = useState([]); //Lấy theo id đợt HST
  const [isCongByIdDotGCGC, setIsCongByIdDotGCGC] = useState([]); //Lấy theo id đợt GCGC
  const [newDataWorkHours, setNewDataWorkHours] = useState({
    month: new Date(),
    periodName: "",
    viewRange: [new Date(), new Date()],
    viewRangeQL: [new Date(), new Date()],
    templateName: "",
    maxViewTime: 0,
    convertData: [],
    PhanQuyenWorkHours: [],
  });
  const [updateWorkHours, setUpdateWorkHours] = useState({
    time_start: new Date(),
    time_end: new Date(),
    time_start_ql: new Date(),
    time_end_ql: new Date(),
    month: new Date(),
    periodName: "",
    templateName: "",
    maxViewTime: 0,
    convertData: [],
    PhanQuyenWorkHours: [],
  });

  //activeTab upload
  const handleNewWorkHoursChange = (name, value) => {
    setNewDataWorkHours((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "file") {
        if (value && value.name) {
          // Kiểm tra xem có file được chọn không
          if (newData.templateName === "2") {
            ConvertFileCSVGioCongGianCa(value);
            toast.info("Đã thêm file thành công, kiểm tra bên dưới");
          } else if (newData.templateName === "1") {
            ConvertFileCSVHeSoThuong(value);
            toast.info("Đã thêm file thành công, kiểm tra bên dưới");
          }
        } else {
          // Nếu không có file được chọn, đặt giá trị file về null
          newData.file = null;
        }
      }
      return newData;
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };
  const getTimeFiveMinutesLater = (minus) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minus); // Thêm  phút vào thời gian hiện tại
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };
  const handleUploadNewFile = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    setIsLoading(true);

    const totalSeconds = newDataWorkHours.maxViewTime * 60;
    const formattedTime = moment.utc(totalSeconds * 1000).format("HH:mm:ss");
    const phanQuyenWorkHours = newDataWorkHours.PhanQuyenWorkHours;
    const startTime = Date.now();
    try {
      const dotCong = {
        ten_dot: newDataWorkHours.periodName,
        bang_cong_t: moment(newDataWorkHours.month.toISOString()).format(
          "MM-yyyy"
        ),
        time_start: moment(newDataWorkHours.viewRange[0]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end: moment(newDataWorkHours.viewRange[1]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_xem: formattedTime,
        loai_phieu: newDataWorkHours.templateName,
        time_start_ql: moment(newDataWorkHours.viewRangeQL[0]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end_ql: moment(newDataWorkHours.viewRangeQL[1]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
      };

      const dotCongAuto = {
        ten_dot: `Đợt công tháng ${moment(
          newDataWorkHours.month.toISOString()
        ).format("MM.yyyy")}`,
        bang_cong_t: moment(newDataWorkHours.month.toISOString()).format(
          "MM-yyyy"
        ),
        time_start: getCurrentDateTime(),
        time_end: getTimeFiveMinutesLater(30),
        time_xem: formattedTime,
        loai_phieu: "3",
        time_start_ql: getCurrentDateTime(),
        time_end_ql: getTimeFiveMinutesLater(30),
      };
      const data = {
        dotCong: [dotCong],
        name: newDataWorkHours.convertData,
        phanQuyenDotCong: phanQuyenWorkHours,
      };
      const dataAutoImport = {
        dotCong: [dotCongAuto],
        phanQuyenDotCong: phanQuyenWorkHours,
      };

      if (newDataWorkHours.templateName === "1") {
        const response = await axios.post(
          `${API_BASE_URL}/dotcong/he-so-thuong`,
          data
        );
        if (response.status === 201) {
          console.log("call api...");
          await axios.post(
            `${API_BASE_URL}/dotcong/bang-cong-chinh`,
            dataAutoImport
          );
          // const response = await axios.post(
          //   `${API_BASE_URL}/dotcong/getall`,
          //   dotCong
          // );
          // if (response.data.length === 0) {
          //   await axios.post(
          //     `${API_BASE_URL}/dotcong/bang-cong-chinh`,
          //     dataAutoImport
          //   );
          // }
          toast.success("Thêm mới thành công");
        } else {
          console.error("Lỗi phản hồi:", response);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      }
      if (newDataWorkHours.templateName === "2") {
        const response = await axios.post(
          `${API_BASE_URL}/dotcong/gio-cong-gian-ca`,
          data
        );
        if (response.status === 201) {
          console.log("call api...");
          await axios.post(
            `${API_BASE_URL}/dotcong/bang-cong-chinh`,
            dataAutoImport
          );
          // const response = await axios.post(
          //   `${API_BASE_URL}/dotcong/getall`,
          //   dotCong
          // );
          // if (response.data.length === 0) {
          //   await axios.post(
          //     `${API_BASE_URL}/dotcong/bang-cong-chinh`,
          //     dataAutoImport
          //   );
          // }
          toast.success("Thêm mới thành công");
        } else {
          console.error("Lỗi phản hồi:", response);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      }

      const endTime = Date.now();
      const loadingTime = endTime - startTime;
      if (loadingTime < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - loadingTime));
      }
      setNewDataWorkHours({
        month: new Date(),
        periodName: "",
        viewRange: [new Date(), new Date()],
        viewRangeQL: [new Date(), new Date()],
        templateName: "",
        maxViewTime: 0,
        convertData: [],
        PhanQuyenWorkHours: [],
      });
      console.log("newDataWorkHours", newDataWorkHours);
    } catch (error) {
      if (error.response) {
        console.error("Lỗi phản hồi:", error.response.data);
        toast.error(`Có lỗi xảy ra. Vui lòng thử lại.`);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false); // Kết thúc loading
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const ConvertFileCSVHeSoThuong = (file) => {
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const filteredData = convertDataHSThuong(results.data);
          setNewDataWorkHours((prev) => ({
            ...prev,
            convertData: filteredData,
          }));
        },
        header: false, // Nếu file CSV có header
        skipEmptyLines: true,
      });
    }
  };

  const ConvertFileCSVGioCongGianCa = (file) => {
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const filteredData = convertDataGioCong(results.data);
          setNewDataWorkHours((prev) => ({
            ...prev,
            convertData: filteredData,
          }));
        },
        header: false, // Nếu file CSV có header
        skipEmptyLines: true,
      });
    }
  };

  const convertDataGioCong = (data) => {
    const relevantData = data.slice(6); // Bỏ qua 6 dòng đầu
    return relevantData.map((item) => {
      return {
        stt: item[0] || "",
        so_the: item[1] || "",
        ho: item[2] || "",
        ten: item[3] || "",
        hanh_Chinh_Ca: parseFloat(item[4].replace(",", ".")) || 0,
        ca3: parseFloat(item[5].replace(",", ".")) || 0,
        ngay_Thuong: parseFloat(item[6].replace(",", ".")) || 0,
        ngay_Nghi_Hang_Tuan: parseFloat(item[7].replace(",", ".")) || 0,
        ngay_Le: parseFloat(item[8].replace(",", ".")) || 0,
        phep: parseFloat(item[9].replace(",", ".")) || 0,
        ky_ten: item[10] || "",
      };
    });
  };

  const convertDataHSThuong = (data) => {
    const relevantData = data.slice(5); // Bỏ qua 5 dòng đầu
    return relevantData.map((item) => {
      return {
        f_To: item[0] || "",
        so_the: item[1] || "",
        ho: item[2] || "",
        ten: item[3] || "",
        col1: parseFloat(item[4].replace(",", ".")) || 0,
        cot2: parseFloat(item[5].replace(",", ".")) || 0,
        cot3: parseFloat(item[6].replace(",", ".")) || 0,
        cot4: parseFloat(item[7].replace(",", ".")) || 0,
        cot5: parseFloat(item[8].replace(",", ".")) || 0,
        cot6: parseFloat(item[9].replace(",", ".")) || 0,
        cot7: parseFloat(item[10].replace(",", ".")) || 0,
        cot8: parseFloat(item[11].replace(",", ".")) || 0,
        cot9: parseFloat(item[12].replace(",", ".")) || 0,
        cot10: parseFloat(item[13].replace(",", ".")) || 0,
        cot11: parseFloat(item[14].replace(",", ".")) || 0,
        cot12: parseFloat(item[15].replace(",", ".")) || 0,
        cot13: parseFloat(item[16].replace(",", ".")) || 0,
        cot14: parseFloat(item[17].replace(",", ".")) || 0,
        cot15: parseFloat(item[18].replace(",", ".")) || 0,
        cot16: parseFloat(item[19].replace(",", ".")) || 0,
        cot17: parseFloat(item[20].replace(",", ".")) || 0,
        cot18: parseFloat(item[21].replace(",", ".")) || 0,
        cot19: parseFloat(item[22].replace(",", ".")) || 0,
        cot20: parseFloat(item[23].replace(",", ".")) || 0,
        cot21: parseFloat(item[24].replace(",", ".")) || 0,
        cot22: parseFloat(item[25].replace(",", ".")) || 0,
        cot23: parseFloat(item[26].replace(",", ".")) || 0,
        cot24: parseFloat(item[27].replace(",", ".")) || 0,
        cot25: parseFloat(item[28].replace(",", ".")) || 0,
        cot26: parseFloat(item[29].replace(",", ".")) || 0,
        cot27: parseFloat(item[30].replace(",", ".")) || 0,
        cot28: parseFloat(item[31].replace(",", ".")) || 0,
        cot29: parseFloat(item[32].replace(",", ".")) || 0,
        cot30: parseFloat(item[33].replace(",", ".")) || 0,
        cot31: parseFloat(item[34].replace(",", ".")) || 0,
        vpcl: parseFloat(item[35].replace(",", ".")) || 0,
        vpkl: parseFloat(item[36].replace(",", ".")) || 0,
        o: parseFloat(item[37].replace(",", ".")) || 0,
        hsbq: parseFloat(item[38].replace(",", ".")) || 0,
        hsbqthg: parseFloat(item[39].replace(",", ".")) || 0,
        ky_ten: item[40] || "",
      };
    });
  };

  const handleShowHeSoThuong = (data) => {
    return (
      <>
        {data.length > 0 ? (
          <>
            <div class="alert alert-primary" role="alert">
              Dữ liệu nhận được: {data.length}
            </div>
            <div class="w-100 overflow-x-scroll">
              <table className="table mt-3 w-100">
                <thead>
                  <tr>
                    <th>Tổ</th>
                    <th>Số Thẻ</th>
                    <th>Họ</th>
                    <th>Tên</th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>8</th>
                    <th>10</th>
                    <th>11</th>
                    <th>12</th>
                    <th>13</th>
                    <th>14</th>
                    <th>15</th>
                    <th>16</th>
                    <th>17</th>
                    <th>18</th>
                    <th>19</th>
                    <th>20</th>
                    <th>21</th>
                    <th>22</th>
                    <th>23</th>
                    <th>24</th>
                    <th>25</th>
                    <th>26</th>
                    <th>27</th>
                    <th>28</th>
                    <th>29</th>
                    <th>30</th>
                    <th>31</th>
                    <th>vpcl</th>
                    <th>vpkl</th>
                    <th>o</th>
                    <th>hsbp</th>
                    <th>hsbqthg</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      <td>{row.f_To}</td>
                      <td>{row.so_the}</td>
                      <td>{row.ho}</td>
                      <td>{row.ten}</td>
                      <th>{row.cot1}</th>
                      <th>{row.cot2}</th>
                      <th>{row.cot3}</th>
                      <th>{row.cot4}</th>
                      <th>{row.cot5}</th>
                      <th>{row.cot6}</th>
                      <th>{row.cot7}</th>
                      <th>{row.cot8}</th>
                      <th>{row.cot9}</th>
                      <th>{row.cot10}</th>
                      <th>{row.cot11}</th>
                      <th>{row.cot12}</th>
                      <th>{row.cot13}</th>
                      <th>{row.cot14}</th>
                      <th>{row.cot15}</th>
                      <th>{row.cot16}</th>
                      <th>{row.cot17}</th>
                      <th>{row.cot18}</th>
                      <th>{row.cot19}</th>
                      <th>{row.cot20}</th>
                      <th>{row.cot21}</th>
                      <th>{row.cot22}</th>
                      <th>{row.cot23}</th>
                      <th>{row.cot24}</th>
                      <th>{row.cot25}</th>
                      <th>{row.cot26}</th>
                      <th>{row.cot27}</th>
                      <th>{row.cot28}</th>
                      <th>{row.cot29}</th>
                      <th>{row.cot30}</th>
                      <th>{row.cot31}</th>
                      <th>{row.vpcl}</th>
                      <th>{row.vpkl}</th>
                      <th>{row.o}</th>
                      <th>{row.hsbq}</th>
                      <th>{row.hsbqthg}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div class="alert alert-danger mx-2 my-2" role="alert">
              Không có dữ liệu. Vui lòng kiểm tra dữ liệu bắt đầu từ Hàng số 6
            </div>
          </>
        )}
      </>
    );
  };

  const handleShowGioCongGianCa = (data) => {
    return (
      <>
        {data.length > 0 ? (
          <>
            <div class="alert alert-primary" role="alert">
              Dữ liệu nhận được: {data.length}
            </div>
            <div class="w-100 overflow-x-scroll">
              <table className="table mt-3 w-100">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Số thẻ</th>
                    <th>Họ</th>
                    <th>Tên</th>
                    <th>Hành chính + Ca1 + Ca2</th>
                    <th>Ca3</th>
                    <th>Ngày thường</th>
                    <th>Ngày nghỉ hàng tuần</th>
                    <th>Ngày lễ</th>
                    <th>PHÉP(giờ)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      <td>{row.stt}</td>
                      <td>{row.so_the}</td>
                      <td>{row.ho}</td>
                      <td>{row.ten}</td>
                      <td>{row.hanh_Chinh_Ca}</td>
                      <td>{row.ca3}</td>
                      <td>{row.ngay_Thuong}</td>
                      <td>{row.ngay_Nghi_Hang_Tuan}</td>
                      <td>{row.ngay_Le}</td>
                      <td>{row.phep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div class="alert alert-danger mx-2 my-2" role="alert">
              Không có dữ liệu. Vui lòng kiểm tra dữ liệu bắt đầu từ Hàng số 7
            </div>
          </>
        )}
      </>
    );
  };

  const handlePhongbanData = (data) => {
    if (activeTab === "new") {
      setNewDataWorkHours((prev) => ({
        ...prev,
        PhanQuyenWorkHours: data,
      }));
    } else if (activeTab === "update") {
      setUpdateWorkHours((prevState) => ({
        ...prevState,
        PhanQuyenWorkHours: data,
      }));
    }
  };
  // Hàm chuyển đổi từ số phút sang 'HH:MM:SS'
  const minutesToTimeString = (minutes) => {
    if (!minutes && minutes !== 0) return "00:00:00";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  const timeStringToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  //activeTab Update
  const handleChangeUpdateWorkHours = (name, value) => {
    setUpdateWorkHours((prev) => {
      let updatedData = { ...prev };

      if (name === "viewRange") {
        updatedData.time_start = value.start;
        updatedData.time_end = value.end;
      } else if (name === "viewRangeQL") {
        updatedData.time_start_ql = value.start;
        updatedData.time_end_ql = value.end;
      } else {
        updatedData[name] = value;
      }

      return updatedData;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: async (result) => {
          let filteredData;

          if (updateWorkHours.templateName === "1") {
            // HSTHUONG
            filteredData = [];
            filteredData = convertDataHSThuong(result.data);
          } else if (updateWorkHours.templateName === "2") {
            //GIO CONG GIAN CA
            filteredData = [];
            filteredData = convertDataGioCong(result.data);
          } else {
            toast.warning("Template không hợp lệ");
            return;
          }

          const updateState = (prevData) => {
            const updatedData = [...prevData];
            for (const newItem of filteredData) {
              if (newItem && newItem.so_the) {
                const normalizedNewId = newItem.so_the
                  .replace(/^LH/, "")
                  .slice(-5);
                const index = updatedData.findIndex(
                  (item) =>
                    item.so_the.replace(/^LH/, "").slice(-5) === normalizedNewId
                );
                if (index !== -1) {
                  // Cập nhật dữ liệu hiện có
                  updatedData[index] = {
                    ...updatedData[index],
                    ...newItem,
                    so_the: normalizedNewId,
                  };
                } else {
                  // Thêm dữ liệu mới nếu không tìm thấy so_the
                  updatedData.push({ ...newItem, so_the: normalizedNewId });
                }
              } else {
                toast.warning("Dòng dữ liệu không hợp lệ:", newItem);
              }
            }
            return updatedData;
          };

          if (updateWorkHours.templateName === "1") {
            setIsCongByIdDotHST((prevData) => {
              return updateState(prevData);
            });
          } else if (updateWorkHours.templateName === "2") {
            setIsCongByIdDotGCGC((prevData) => {
              return updateState(prevData);
            });
          }
        },
      });
    } else {
      // Xử lý khi không có file được chọn (ví dụ: người dùng hủy chọn file)
      toast.warning("Không có file được chọn");
      // Có thể thêm logic để xóa dữ liệu đã parse trước đó nếu cần
      if (updateWorkHours.templateName === "1") {
        setIsCongByIdDotHST([]);
      } else if (updateWorkHours.templateName === "2") {
        setIsCongByIdDotGCGC([]);
      }
    }
  };

  const handleSubmitUpdateWorkHours = async (e) => {
    e.preventDefault();
    setIsUpdating(true); // Bắt đầu loading
    setIsLoading(true);
    try {
      const totalSeconds = maxViewTime * 60;
      const formattedTime = moment.utc(totalSeconds * 1000).format("HH:mm:ss");

      const dotCong = {
        time_start: moment(updateWorkHours.time_start).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end: moment(updateWorkHours.time_end).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_xem: formattedTime ? formattedTime : "",
        time_start_ql: moment(updateWorkHours.time_start_ql).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end_ql: moment(updateWorkHours.time_end_ql).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
      };
      // console.log("updateWorkHours", updateWorkHours);
      // console.log("isDotCong.id", isDotCong.id);
      // console.log("loaiphieu", isDotCong?.loai_phieu);
      // console.log("isCongByIdDotGCGC", isCongByIdDotGCGC);
      // console.log("isCongByIdDotHST", isCongByIdDotHST);
      const updateDot = await axios.put(
        `${API_BASE_URL}/dotcong/${isDotCong.id}`,
        {
          dotCong,
        }
      );
      console.log(
        "Dữ liệu đợt công đã được cập nhật vào CSDL:",
        updateDot.data.message
      );

      const updatePhanQuyenDotCong = await axios.put(
        `${API_BASE_URL}/phanquyen/phongban/phan-quyen-dot-cong/${isDotCong.id}`,
        {
          id_dot: isDotCong.id,
          phanQuyenDotCong: updateWorkHours.PhanQuyenWorkHours,
        }
      );

      console.log(
        "updatePhanQuyenDotCong",
        updatePhanQuyenDotCong.data.message
      );

      // Kiểm tra xem có file được tải lên không

      if (
        (isCongByIdDotGCGC.length > 0 || isCongByIdDotHST.length > 0) &&
        isDotCong.loai_phieu !== "3"
      ) {
        // console.log("có chạy vô đây hong...");
        let dataToUpdate;
        if (updateWorkHours.templateName === "1") {
          dataToUpdate = isCongByIdDotHST;
        } else if (updateWorkHours.templateName === "2") {
          dataToUpdate = isCongByIdDotGCGC;
        } else {
          toast.error("Template không hợp lệ");
          return;
        }

        // Đảm bảo dataToUpdate là một mảng
        if (!Array.isArray(dataToUpdate)) {
          dataToUpdate = [dataToUpdate];
        }

        // Lọc bỏ các trường có giá trị null hoặc undefined
        const filteredData = dataToUpdate.map((item) => {
          const filteredItem = {};
          for (const [key, value] of Object.entries(item)) {
            if (value != null && value !== "") {
              filteredItem[key] = value;
            }
          }
          return filteredItem;
        });
        const data = filteredData.filter(
          (item) => Object.keys(item).length > 0
        );

        if (data.length === 0) {
          toast.warning("Không có dữ liệu hợp lệ để cập nhật.");
          return;
        }
        const endpoint =
          updateWorkHours.templateName === "1"
            ? "dotcong/save-hst"
            : "dotcong/save-gcgc";

        await axios.put(`${API_BASE_URL}/${endpoint}`, {
          data: data,
          id_dot: isDotCong.id,
        });
        toast.success("Cập nhật dữ liệu đợt công và chi tiết thành công!");
      } else {
        toast.success("Cập nhật thông tin đợt công thành công.");
        toast.warning(" Bạn không được phép cập nhật bảng công chính!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu vào CSDL:", error);
      toast.error("Có lỗi xảy ra khi cập nhật dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const DotCong = async () => {
    if (updateWorkHours.month) {
      try {
        const formattedMonth = moment(updateWorkHours.month).format("MM-YYYY");
        const response = await axios.get(
          `${API_BASE_URL}/dotcong/month/${formattedMonth}`
        );
        setDotCong(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đợt công:", error);
        setDotCong([]);
      }
    } else {
      setDotCong([]);
    }
  };

  const DotCongByName = async () => {
    const periodName = updateWorkHours.periodName;
    if (!periodName) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/dotcong/${periodName}`);
      setIsDotCong(response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt công:", error);
      setIsDotCong([]);
      return null;
    }
  };

  const isDotLuongByIdDot = async (dotCong) => {
    if (!dotCong || !dotCong.id || !dotCong.loai_phieu) return;

    const endpoint =
      dotCong.loai_phieu === "1" ? "he-so-thuong" : "gio-cong-gian-ca";
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dotcong/${endpoint}/id_dot/${dotCong.id}`
      );
      if (dotCong.loai_phieu === "1") {
        setIsCongByIdDotHST(response.data);
      } else {
        setIsCongByIdDotGCGC(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt công:", error);
      if (dotCong.loai_phieu === "1") {
        setIsCongByIdDotHST([]);
      } else {
        setIsCongByIdDotGCGC([]);
      }
    }
  };

  // Gọi fetchData trong useEffect
  useEffect(() => {
    const fetchData = async () => {
      await DotCong();
      const dotCong = await DotCongByName();
      if (dotCong) {
        setUpdateWorkHours((prev) => ({
          ...prev,
          templateName: dotCong.loai_phieu,
        }));
        await isDotLuongByIdDot(dotCong);
      }
    };
    fetchData();
  }, [updateWorkHours.month, updateWorkHours.periodName]);

  useEffect(() => {
    setMaxViewTime(timeStringToMinutes(isDotCong.time_xem));
  }, [isDotCong.time_xem]);

  useEffect(() => {
    if (isDotCong) {
      setUpdateWorkHours((prev) => ({
        ...prev,
        time_start: isDotCong.time_start
          ? new Date(isDotCong.time_start)
          : null,
        time_end: isDotCong.time_end ? new Date(isDotCong.time_end) : null,
        time_start_ql: isDotCong.time_start_ql
          ? new Date(isDotCong.time_start_ql)
          : null,
        time_end_ql: isDotCong.time_end_ql
          ? new Date(isDotCong.time_end_ql)
          : null,
      }));
    }
  }, [isDotCong]);
  return (
    <div className="container-fluid p-0 pe-2 pe-md-0">
      <h1 className="h3 mb-3">
        <strong>Tải lên</strong> bảng công
      </h1>
      {(isLoading || isUpdating || isSubmitting) && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Đang xử lý...</span>
          </div>
        </div>
      )}
      <ul className="nav nav-tabs nav-pills nav-fill" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link p-3 size-1 ${
              activeTab === "new" ? "active" : ""
            }`}
            onClick={() => setActiveTab("new")}
          >
            Tải mới bảng công
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link p-3 size-1 ${
              activeTab === "update" ? "active" : ""
            }`}
            onClick={() => setActiveTab("update")}
          >
            Cập nhật bảng công
          </button>
        </li>
      </ul>

      <div className="tab-content bg-tab" id="myTabContent">
        {activeTab === "new" ? (
          <div className="tab-pane fade show active" role="tabpanel">
            <div className="container-fluid py-3">
              <h4 className="text-center mb-4 text-primary h2 fw-bold">
                THÔNG TIN THÊM BẢNG CÔNG
              </h4>
              <form onSubmit={handleUploadNewFile} className="needs-validation">
                <div className="row">
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative w-100">
                      <label
                        htmlFor="new-month-workhours"
                        className="form-label"
                      >
                        Bảng công tháng
                      </label>
                      <DatePicker
                        selected={newDataWorkHours.month}
                        onChange={(date) =>
                          handleNewWorkHoursChange("month", date)
                        }
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="form-control w-auto"
                        id="new-month-workhours"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label htmlFor="new-period-name" className="form-label">
                        Tên đợt công
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="new-period-name"
                        value={newDataWorkHours.periodName}
                        onChange={(e) =>
                          handleNewWorkHoursChange("periodName", e.target.value)
                        }
                        placeholder={`Đợt hệ số thưởng hoặc giờ công giãn ca tháng ${
                          new Date().getMonth() + 1
                        }`}
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-max-time-view-workhours"
                        className="form-label"
                      >
                        Số phút tối đa xem công
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="new-max-time-view-workhours"
                        value={newDataWorkHours.maxViewTime}
                        onChange={(e) =>
                          handleNewWorkHoursChange(
                            "maxViewTime",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-workhours"
                        className="form-label"
                      >
                        Thời gian cho CNV xem công
                      </label>
                      <RangeDateTimePicker
                        onChange={(update) =>
                          handleNewWorkHoursChange("viewRange", update)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-workhours"
                        className="form-label"
                      >
                        Thời gian cho Quản lý xem
                      </label>
                      <RangeDateTimePicker
                        onChange={(update) =>
                          handleNewWorkHoursChange("viewRangeQL", update)
                        }
                      />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label htmlFor="new-template-name" className="form-label">
                        Tên mẫu file
                      </label>
                      <select
                        className="form-select"
                        id="new-template-name"
                        value={newDataWorkHours.templateName}
                        onChange={(e) =>
                          handleNewWorkHoursChange(
                            "templateName",
                            e.target.value
                          )
                        }
                        required
                        disabled={newDataWorkHours.templateName} // Disable if file is uploaded
                      >
                        <option value="">Chọn mẫu file</option>
                        <option value="1">Mẫu hệ số thưởng</option>
                        <option value="2">Mẫu giờ công giãn ca</option>
                      </select>
                    </div>
                  </div>
                  {newDataWorkHours.templateName && (
                    <div className="col-sm-6 col-lg-4">
                      <div className="mb-3 position-relative">
                        <label
                          htmlFor="new-file-workhours"
                          className="form-label"
                        >
                          File CSV{" "}
                          {newDataWorkHours.templateName === "1"
                            ? "hệ số thưởng"
                            : "giờ công giãn ca"}
                        </label>

                        <input
                          className="form-control"
                          type="file"
                          id="new-file-workhours"
                          onChange={(e) =>
                            handleNewWorkHoursChange(
                              "file",
                              e.target.files ? e.target.files[0] : null
                            )
                          }
                          accept=".csv"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <PhongbanPhanquyenWorkHours
                    onSubmit={(data) => {
                      handlePhongbanData(data);
                    }}
                    activeTab={activeTab}
                  />
                </div>
                <div className="row justify-content-center">
                  <div className="col-sm-6 col-md-5 text-center">
                    <button
                      className="btn btn-secondary mx-2"
                      onClick={() => {
                        setNewDataWorkHours({
                          month: new Date(),
                          periodName: "",
                          viewRangeQL: [new Date(), new Date()],
                          maxViewTime: 0,
                          templateName: "",
                        });
                      }}
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary mx-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Đang xử lý...
                        </>
                      ) : (
                        "Thêm bảng công"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="tab-pane fade show active" role="tabpanel">
            <div className="container-fluid py-3">
              <h4 className="text-center mb-4 text-primary h2 fw-bold">
                THÔNG TIN CẬP NHẬT BẢNG CÔNG
              </h4>
              <form
                onSubmit={handleSubmitUpdateWorkHours}
                className="needs-validation"
              >
                <div className="row">
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-month-work-hours"
                        className="form-label"
                      >
                        Bảng công tháng
                      </label>
                      <DatePicker
                        selected={updateWorkHours.month}
                        onChange={(date) =>
                          handleChangeUpdateWorkHours("month", date)
                        }
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="form-control"
                        id="update-month-work-hours"
                        required
                      />
                      <div className="invalid-tooltip">Vui lòng chọn tháng</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-period-name"
                        className="form-label"
                      >
                        Tên đợt công
                      </label>
                      <select
                        className="form-select"
                        id="update-period-name"
                        value={updateWorkHours.periodName}
                        onChange={(e) =>
                          handleChangeUpdateWorkHours(
                            "periodName",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Chọn đợt công</option>
                        {dotCong && dotCong.length > 0 ? (
                          dotCong.map((dot) => (
                            <option key={dot.id} value={dot.id}>
                              {dot.ten_dot}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Không có đợt công
                          </option>
                        )}
                      </select>

                      <div className="invalid-tooltip">
                        Vui lòng chọn đợt công.
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-max-time-view-work-hours"
                        className="form-label"
                      >
                        Số phút tối đa xem công
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="update-max-time-view-work-hours"
                        value={maxViewTime}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          setMaxViewTime(newValue);
                          handleChangeUpdateWorkHours(
                            "maxViewTime",
                            minutesToTimeString(newValue)
                          );
                        }}
                        min="1"
                        required
                      />
                      <div className="invalid-tooltip">
                        Vui lòng nhập số phút tối đa
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-workhours"
                        className="form-label"
                      >
                        Thời gian cho CNV xem công
                      </label>

                      <RangeDateTimePicker
                        startDate={updateWorkHours.time_start}
                        endDate={updateWorkHours.time_end}
                        onChange={(update) => {
                          console.log("DateRange updated:", update);
                          handleChangeUpdateWorkHours("viewRange", {
                            start: update[0],
                            end: update[1],
                          });
                        }}
                        minDate={new Date()}
                        maxDate={
                          new Date(
                            new Date().setFullYear(new Date().getFullYear() + 1)
                          )
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-workhours"
                        className="form-label"
                      >
                        Thời gian cho Quản lý xem công
                      </label>

                      <RangeDateTimePicker
                        startDate={isDotCong.time_start_ql}
                        endDate={isDotCong.time_end_ql}
                        onChange={(update) => {
                          console.log("DateRange updated:", update);
                          handleChangeUpdateWorkHours("viewRangeQL", {
                            start: update[0],
                            end: update[1],
                          });
                        }}
                        minDate={new Date()}
                        maxDate={
                          new Date(
                            new Date().setFullYear(new Date().getFullYear() + 1)
                          )
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-template-name"
                        className="form-label"
                      >
                        Tên mẫu file
                      </label>
                      <select
                        className="form-select"
                        id="update-template-name"
                        value={updateWorkHours.templateName}
                        onChange={(e) =>
                          handleChangeUpdateWorkHours(
                            "templateName",
                            e.target.value
                          )
                        }
                        disabled
                        required
                      >
                        <option value="">Chọn mẫu file</option>
                        <option value="1">Mẫu hệ số thưởng</option>
                        <option value="2">Mẫu giờ công giãn ca</option>
                      </select>
                      <div className="invalid-tooltip">
                        Vui lòng chọn mẫu file.
                      </div>
                    </div>
                  </div>

                  {updateWorkHours.periodName === "1" ||
                  updateWorkHours.periodName === "3" ? (
                    <div className="col-sm-6 col-lg-4">
                      <div className="mb-3 position-relative">
                        <label
                          htmlFor="update-file-work-hours"
                          className="form-label"
                        >
                          File CSV công
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          id="update-file-work-hours"
                          onChange={handleFileUpload}
                          accept=".csv"
                        />
                        <div className="invalid-tooltip">
                          Vui lòng chọn file csv
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <PhongbanPhanquyenWorkHours
                  onSubmit={handlePhongbanData}
                  activeTab={activeTab}
                  initialData={isDotCong.id}
                />
                <div className="row justify-content-center">
                  <div className="col-sm-6 col-md-4 text-center">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật bảng công"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === "new" ? (
          <>
            {newDataWorkHours.templateName &&
              newDataWorkHours.convertData &&
              newDataWorkHours.convertData.length > 0 && (
                <>
                  {newDataWorkHours.templateName === "2"
                    ? handleShowGioCongGianCa(newDataWorkHours.convertData)
                    : newDataWorkHours.templateName === "1"
                    ? handleShowHeSoThuong(newDataWorkHours.convertData)
                    : null}
                </>
              )}
          </>
        ) : (
          <>
            {updateWorkHours.templateName && updateWorkHours.convertData && (
              <>
                {updateWorkHours.templateName === "2"
                  ? handleShowGioCongGianCa(isCongByIdDotGCGC)
                  : updateWorkHours.templateName === "1"
                  ? handleShowHeSoThuong(isCongByIdDotHST)
                  : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadWorkHours;
