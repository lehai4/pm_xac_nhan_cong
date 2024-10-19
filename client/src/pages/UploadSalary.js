import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RangeDateTimePicker } from "../components/DatePickerComponents";
import Papa from "papaparse";
import axios from "axios";
import moment from "moment";
import { API_BASE_URL } from "../config/api";
import PhongbanPhanquyen from "../components/PhongbanPhanquyen";
import { toast } from "react-toastify";

function UploadSalary() {
  const [activeTab, setActiveTab] = useState("new");
  const [newSalaryData, setNewSalaryData] = useState({
    month: new Date(),
    periodName: "",
    paymentDate: new Date(),
    viewRange: [new Date(), new Date()],
    viewRangeQL: [new Date(), new Date()],
    templateName: "",
    maxViewTime: 0,
    parsedData: [],
    PhanQuyenSalary: [], // Thêm trường PhanQuyenSalary
  });
  const [updateSalaryData, setUpdateSalaryData] = useState({
    time_start: new Date(),
    time_end: new Date(),
    time_start_ql: new Date(),
    time_end_ql: new Date(),
    month: new Date(),
    periodName: "",
    paymentDate: new Date(),
    templateName: "",
    maxViewTime: 0,
    parsedData: [],
    PhanQuyenSalary: [], // Thêm trường PhanQuyenSalary
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleNewSalaryChange = (name, value) => {
    setNewSalaryData((prev) => {
      const updatedData = { ...prev, [name]: value };

      if (name === "file") {
        if (value && value.name) {
          // Kiểm tra xem có file được chọn không
          if (updatedData.templateName === "2") {
            parseCSVDot2(value);
            toast.info("Đã thêm file thành công, kiểm tra bên dưới");
          } else if (updatedData.templateName === "1") {
            parseCSVDot1(value);
            toast.info("Đã thêm file thành công, kiểm tra bên dưới");
          }
        } else {
          // Nếu không có file được chọn, đặt giá trị file về null
          updatedData.file = null;
          // Có thể cần xóa dữ liệu đã parse trước đó
          updatedData.parsedData = [];
        }
      }
      return updatedData;
    });
  };

  const parseCSVDot1 = (file) => {
    Papa.parse(file, {
      header: false, // Sử dụng tên cột thay vì chỉ số
      skipEmptyLines: true,
      complete: (result) => {
        const startRow = 0; // Hàng số 9
        const filteredData = [];

        for (let i = startRow; i < result.data.length; i++) {
          const row = result.data[i];

          // Kiểm tra nếu cột 1 không phải là số nguyên thì dừng lại
          if (Number.isInteger(Number(row[0])) && row[0] !== "") {
            const parseFloatSafe = (value) => {
              if (
                value === undefined ||
                value === null ||
                value.trim() === ""
              ) {
                return 0;
              }
              const parsed = parseFloat(value);
              return isNaN(parsed) ? 0 : parsed;
            };

            const gcptg = parseFloatSafe(row[6]) + parseFloatSafe(row[7]);

            filteredData.push({
              ma_nv: row[2], // Column3
              ho_ten: row[3], // Column4
              to_in_luong: row[42], // Column43
              ma_so_thue: row[1], // Column2
              muc_luong_hd: row[4], // Column5
              gio_cong_thuc_te: row[9], // Column10
              gio_cong_T7_CN_CT: row[11], // Column12
              gio_cong_ngay_thuong: row[12], // Column13
              gio_cong_nghi: row[13], // Column14
              gio_cong_phep_thoi_gian: gcptg ? gcptg : 0,
              gio_cong_huan_luyen: row[10], // Column11
              luong_tg_phep: row[5], // Column6
              luong_truc_tiep: row[14], // Column15
              luong_gian_tiep: row[15], // Column16
              phu_cap_lam_dem: row[16], // Column17
              luong_lam_them_ngay_thuong: row[17], // Column18
              luong_lam_them_ngay_nghi: row[18], // Column19
              thuong_kpi_san_xuat: row[19], // Column20
              thuong_cb_nv_gioi: row[20], // Column21
              phu_cap_kiem_viec: row[21], // Column22
              phu_cap_con_nho: row[22], // Column23
              phu_cap_di_lai_xang_xe: row[23], // Column24
              phu_cap_tien_an: row[24], // Column25
              thuong_hoan_thanh_kh_thang: row[25], // Column26
              thuong_hoan_thanh_kh_ngay: row[26], // Column27
              bo_sung_tron_so_chi_tien_mat: row[28], // Column29
              cac_khoan_khac: row[27], // Column28
              tong_cong: row[29], // Column30
              thue_thu_nhap: row[30], // Column31
              bao_hiem: row[31], // Column32
              thu_hoi_phep: row[32], // Column33
              thuc_lanh: row[33], // Column34
            });
          } else {
            continue;
          }
        }

        console.log("Lấy tất cả dữ liệu", filteredData);
        if (activeTab === "new") {
          setNewSalaryData((prev) => ({
            ...prev,
            parsedData: filteredData,
          }));
        } else if (activeTab === "update") {
          setUpdateSalaryData((prev) => ({
            ...prev,
            parsedData: filteredData,
          }));
        }
      },
    });
  };

  const parseCSVDot2 = (file) => {
    Papa.parse(file, {
      header: false, // Sử dụng tên cột thay vì chỉ số
      skipEmptyLines: true,
      complete: (result) => {
        const startRow = 0; // Dữ liệu bắt đầu từ hàng số 9
        const filteredData = [];

        for (let i = startRow; i < result.data.length; i++) {
          const row = result.data[i];

          // Thêm hàng vào filteredData
          if (Number.isInteger(Number(row[0])) && row[0] !== "") {
            filteredData.push({
              ma_nv: row[1],
              ho_ten: `${row[2]} ${row[3]}`,
              gio_cong_lam_them_nt: row[12],
              gio_cong_lam_them_nn: row[14],
              phu_cap_dem: row[18],
              lam_them_nt: row[13],
              lam_them_nn: row[15],
              thuong_ksnx_ngay_thuong: row[11],
              tien_xe: row[17],
              tien_an: row[16],
              bo_sung_so_cho_tien_mat: row[20],
              cac_khoan_khac: row[19],
              tong_cong: row[21],
            });
          }
        }
        console.log("Lấy tất cả dữ liệu", filteredData);
        if (activeTab === "new") {
          setNewSalaryData((prev) => ({
            ...prev,
            parsedData: filteredData,
          }));
        } else if (activeTab === "update") {
          setUpdateSalaryData((prev) => ({
            ...prev,
            parsedData: filteredData,
          }));
        }
      },
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNewSalarySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    setIsLoading(true);
    // Chuyển đổi parsedData
    const convertItem = (item) => {
      return {
        ma_nv: item.ma_nv.slice(2),
        ho_ten: item.ho_ten,
        to_in_luong: item.to_in_luong,
        ma_so_thue:
          item.ma_so_thue &&
          !isNaN(Number(item.ma_so_thue)) &&
          item.ma_so_thue.trim() !== ""
            ? Number(item.ma_so_thue)
            : 0,
        muc_luong_hd:
          item.muc_luong_hd && item.muc_luong_hd.trim() !== ""
            ? Number(item.muc_luong_hd.replace(/,/g, ""))
            : 0,
        gio_cong_thuc_te:
          !isNaN(parseFloat(item.gio_cong_thuc_te)) &&
          item.gio_cong_thuc_te.trim() !== ""
            ? parseFloat(item.gio_cong_thuc_te)
            : 0,
        gio_cong_T7_CN_CT:
          !isNaN(parseFloat(item.gio_cong_T7_CN_CT)) &&
          item.gio_cong_T7_CN_CT.trim() !== ""
            ? parseFloat(item.gio_cong_T7_CN_CT)
            : 0,
        gio_cong_ngay_thuong:
          item.gio_cong_ngay_thuong &&
          !isNaN(parseFloat(item.gio_cong_ngay_thuong)) &&
          item.gio_cong_ngay_thuong.trim() !== ""
            ? parseFloat(item.gio_cong_ngay_thuong)
            : 0,
        gio_cong_nghi:
          item.gio_cong_nghi &&
          !isNaN(parseFloat(item.gio_cong_nghi)) &&
          item.gio_cong_nghi.trim() !== ""
            ? parseFloat(item.gio_cong_nghi)
            : 0,
        gio_cong_phep_thoi_gian: !isNaN(
          parseFloat(item.gio_cong_phep_thoi_gian)
        )
          ? parseFloat(item.gio_cong_phep_thoi_gian)
          : 0,
        gio_cong_huan_luyen:
          item.gio_cong_huan_luyen &&
          item.gio_cong_huan_luyen.trim() !== "" &&
          !isNaN(parseFloat(item.gio_cong_huan_luyen))
            ? parseFloat(item.gio_cong_huan_luyen)
            : 0,
        luong_tg_phep:
          item.luong_tg_phep && item.luong_tg_phep.trim() !== ""
            ? Number(item.luong_tg_phep.replace(/,/g, ""))
            : 0,
        luong_truc_tiep:
          item.luong_truc_tiep && item.luong_truc_tiep.trim() !== ""
            ? Number(item.luong_truc_tiep.replace(/,/g, ""))
            : 0,
        luong_gian_tiep:
          item.luong_gian_tiep && item.luong_gian_tiep.trim() !== ""
            ? Number(item.luong_gian_tiep.replace(/,/g, ""))
            : 0,
        phu_cap_dem:
          item.phu_cap_dem && item.phu_cap_dem.trim() !== ""
            ? Number(item.phu_cap_dem.replace(/,/g, ""))
            : 0,
        luong_lam_them_ngay_thuong:
          item.luong_lam_them_ngay_thuong &&
          item.luong_lam_them_ngay_thuong.trim() !== ""
            ? Number(item.luong_lam_them_ngay_thuong.replace(/,/g, ""))
            : 0,
        luong_lam_them_ngay_nghi:
          item.luong_lam_them_ngay_nghi &&
          item.luong_lam_them_ngay_nghi.trim() !== ""
            ? Number(item.luong_lam_them_ngay_nghi.replace(/,/g, ""))
            : 0,
        thuong_kpi_san_xuat:
          item.thuong_kpi_san_xuat && item.thuong_kpi_san_xuat.trim() !== ""
            ? Number(item.thuong_kpi_san_xuat.replace(/,/g, ""))
            : 0,
        thuong_cb_nv_gioi:
          item.thuong_cb_nv_gioi && item.thuong_cb_nv_gioi.trim() !== ""
            ? Number(item.thuong_cb_nv_gioi.replace(/,/g, ""))
            : 0,
        phu_cap_kiem_viec:
          item.phu_cap_kiem_viec && item.phu_cap_kiem_viec.trim() !== ""
            ? Number(item.phu_cap_kiem_viec.replace(/,/g, ""))
            : 0,
        phu_cap_con_nho:
          item.phu_cap_con_nho && item.phu_cap_con_nho.trim() !== ""
            ? Number(item.phu_cap_con_nho.replace(/,/g, ""))
            : 0,
        phu_cap_di_lai_xang_xe:
          item.phu_cap_di_lai_xang_xe &&
          item.phu_cap_di_lai_xang_xe.trim() !== ""
            ? Number(item.phu_cap_di_lai_xang_xe.replace(/,/g, ""))
            : 0,
        phu_cap_tien_an:
          item.phu_cap_tien_an && item.phu_cap_tien_an.trim() !== ""
            ? Number(item.phu_cap_tien_an.replace(/,/g, ""))
            : 0,
        thuong_hoan_thanh_kh_thang:
          item.thuong_hoan_thanh_kh_thang &&
          item.thuong_hoan_thanh_kh_thang.trim() !== ""
            ? Number(item.thuong_hoan_thanh_kh_thang.replace(/,/g, ""))
            : 0,
        thuong_hoan_thanh_kh_ngay:
          item.thuong_hoan_thanh_kh_ngay &&
          item.thuong_hoan_thanh_kh_ngay.trim() !== ""
            ? Number(item.thuong_hoan_thanh_kh_ngay.replace(/,/g, ""))
            : 0,
        bo_sung_tron_so_chi_tien_mat:
          item.bo_sung_tron_so_chi_tien_mat &&
          item.bo_sung_tron_so_chi_tien_mat.trim() !== ""
            ? Number(item.bo_sung_tron_so_chi_tien_mat.replace(/,/g, ""))
            : 0,
        cac_khoan_khac:
          item.cac_khoan_khac && item.cac_khoan_khac.trim() !== ""
            ? Number(item.cac_khoan_khac.replace(/,/g, ""))
            : 0,
        tong_cong:
          item.tong_cong && item.tong_cong.trim() !== ""
            ? Number(item.tong_cong.replace(/,/g, ""))
            : 0,
        thue_thu_nhap:
          item.thue_thu_nhap && item.thue_thu_nhap.trim() !== ""
            ? Number(item.thue_thu_nhap.replace(/,/g, ""))
            : 0,
        bao_hiem:
          item.bao_hiem && item.bao_hiem.trim() !== ""
            ? Number(item.bao_hiem.replace(/,/g, ""))
            : 0,
        thu_hoi_phep:
          item.thu_hoi_phep && item.thu_hoi_phep.trim() !== ""
            ? Number(item.thu_hoi_phep.replace(/,/g, ""))
            : 0,
        thuc_lanh:
          item.thuc_lanh && item.thuc_lanh.trim() !== ""
            ? Number(item.thuc_lanh.replace(/,/g, ""))
            : 0,
      };
    };

    const convertedD1 = newSalaryData.parsedData.map(convertItem);

    const convertItemD2 = (item) => ({
      ma_nv: item.ma_nv.slice(2),
      ho_ten: item.ho_ten,
      gio_cong_lam_them_nt:
        item.gio_cong_lam_them_nt && item.gio_cong_lam_them_nt.trim() !== ""
          ? parseFloat(item.gio_cong_lam_them_nt)
          : 0,
      gio_cong_lam_them_nn:
        item.gio_cong_lam_them_nn && item.gio_cong_lam_them_nn.trim() !== ""
          ? parseFloat(item.gio_cong_lam_them_nn)
          : 0,
      phu_cap_dem:
        item.phu_cap_dem && item.phu_cap_dem.trim() !== ""
          ? Number(item.phu_cap_dem.replace(/,/g, ""))
          : 0,
      lam_them_nt:
        item.lam_them_nt && item.lam_them_nt.trim() !== ""
          ? Number(item.lam_them_nt.replace(/,/g, ""))
          : 0,
      lam_them_nn:
        item.lam_them_nn && item.lam_them_nn.trim() !== ""
          ? Number(item.lam_them_nn.replace(/,/g, ""))
          : 0,
      thuong_ksnx_ngay_thuong:
        item.thuong_ksnx_ngay_thuong &&
        item.thuong_ksnx_ngay_thuong.trim() !== ""
          ? Number(item.thuong_ksnx_ngay_thuong)
          : 0,
      tien_xe:
        item.tien_xe && item.tien_xe.trim() !== ""
          ? Number(item.tien_xe.replace(/,/g, ""))
          : 0, // Kiểm tra giá trị
      tien_an:
        item.tien_an && item.tien_an.trim() !== ""
          ? Number(item.tien_an.replace(/,/g, ""))
          : 0, // Kiểm tra giá trị
      bo_sung_so_cho_tien_mat:
        item.bo_sung_so_cho_tien_mat &&
        item.bo_sung_so_cho_tien_mat.trim() !== ""
          ? Number(item.bo_sung_so_cho_tien_mat)
          : 0, // Kiểm tra giá trị
      cac_khoan_khac:
        item.cac_khoan_khac && item.cac_khoan_khac.trim() !== ""
          ? Number(item.cac_khoan_khac.replace(/,/g, ""))
          : 0,
      tong_cong:
        item.tong_cong && item.tong_cong.trim() !== ""
          ? Number(item.tong_cong.replace(/,/g, ""))
          : 0, // Kiểm tra giá trị
    });

    const convertedD2 = newSalaryData.parsedData.map(convertItemD2);

    const totalSeconds = newSalaryData.maxViewTime * 60;
    const formattedTime = moment.utc(totalSeconds * 1000).format("HH:mm:ss");

    const PhanQuyenSalary = newSalaryData.PhanQuyenSalary;
    const template = newSalaryData.templateName;
    const startTime = Date.now();
    console.log("PhanQuyenSalary", PhanQuyenSalary);
    try {
      const dotLuong = {
        ten_dot: newSalaryData.periodName,
        bang_luong_t: moment(newSalaryData.month.toISOString()).format(
          "MM-yyyy"
        ),
        ngay_thanh_toan: moment(newSalaryData.paymentDate).format("yyyy/MM/DD"),
        time_start: moment(newSalaryData.viewRange[0]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end: moment(newSalaryData.viewRange[1]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_xem: formattedTime,
        loai_phieu: template,
        time_start_ql: moment(newSalaryData.viewRangeQL[0]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end_ql: moment(newSalaryData.viewRangeQL[1]).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
      };

      if (template === "1") {
        const ChiTrong = {
          dotLuong: [dotLuong],
          chiTrong: convertedD1,
          phanQuyenSalary: PhanQuyenSalary,
        };
        const response = await axios.post(`${API_BASE_URL}/chitrong`, ChiTrong);
        if (response.status === 201) {
          toast.success("Thêm mới thành công");
        } else {
          console.error("Lỗi phản hồi:", response);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      } else if (template === "2") {
        const ChiNgoai = {
          dotLuong: [dotLuong],
          ChiNgoai: convertedD2,
          phanQuyenSalary: PhanQuyenSalary,
        };
        console.log("ChiNgoai", ChiNgoai);
        const response = await axios.post(`${API_BASE_URL}/chingoai`, ChiNgoai);
        if (response.status === 201) {
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
      console.log("newSalaryData", newSalaryData);
    } catch (error) {
      console.log("Error:", error);
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

  const renderSalaryTableD1 = (data) => {
    return (
      <>
        {data.length > 0 ? (
          <>
            <div class="alert alert-primary" role="alert">
              Dữ liệu nhận được: {data.length}
            </div>
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Đơn vị</th>
                  <th>Mã số thuế</th>
                  <th>Mức LGHĐLĐ</th>
                  <th>Gctt</th>
                  <th>Gcttbctcb</th>
                  <th>Gcgc</th>
                  <th>Gcnn</th>
                  <th>Gcfep + gctg</th>
                  <th>Các khoản khác</th>
                  <th>Lương tổng cộng</th>
                  <th>Thuế thu nhập</th>
                  <th>Bảo hiểm</th>
                  <th>Thu hồi phép</th>
                  <th>Cuối kỳ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ma_nv}</td>
                    <td>{row.ho_ten}</td>
                    <td>{row.to_in_luong}</td>
                    <td>{row.ma_so_thue}</td>
                    <td>{row.muc_luong_hd}</td>
                    <td>{row.gio_cong_thuc_te}</td>
                    <td>{row.gio_cong_T7_CN_CT}</td>
                    <td>{row.gio_cong_ngay_thuong}</td>
                    <td>{row.gio_cong_nghi}</td>
                    <td>{row.gio_cong_phep_thoi_gian}</td>
                    <td>{row.cac_khoan_khac}</td>
                    <td>{row.tong_cong}</td>
                    <td>{row.thue_thu_nhap}</td>
                    <td>{row.bao_hiem}</td>
                    <td>{row.thu_hoi_phep}</td>
                    <td>{row.thuc_lanh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div class="alert alert-danger mx-2 my-2" role="alert">
              Không có dữ liệu. Vui lòng kiểm tra dữ liệu bắt đầu từ Hàng số 9
            </div>
          </>
        )}
      </>
    );
  };

  const renderSalaryTableD2 = (data) => {
    return (
      <>
        {data.length > 0 ? (
          <>
            <div className="alert alert-primary" role="alert">
              Dữ liệu nhận được: {data.length}
            </div>
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>gcgc</th>
                  <th>gcnn</th>
                  <th>Làm đêm</th>
                  <th>Làm thêm NT</th>
                  <th>Làm thêm NN</th>
                  <th>Thưởng KQSX</th>
                  <th>Đi lại - Xăng xe</th>
                  <th>Phụ cấp Tiền ăn</th>
                  <th>BS</th>
                  <th>Các khoản khác</th>
                  <th>Thực Lãnh</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0).map((row, index) => (
                  <tr key={index}>
                    <td>{row.ma_nv || ""}</td>
                    <td>{row.ho_ten || ""}</td>
                    <td>{row.gio_cong_lam_them_nt || 0}</td>
                    <td>{row.gio_cong_lam_them_nn || 0}</td>
                    <td>{row.phu_cap_dem || 0}</td>
                    <td>{row.lam_them_nt || 0}</td>
                    <td>{row.lam_them_nn || 0}</td>
                    <td>{row.thuong_ksnx_ngay_thuong || 0}</td>
                    <td>{row.tien_xe || 0}</td>
                    <td>{row.tien_an || 0}</td>
                    <td>{row.bo_sung_so_cho_tien_mat || 0}</td>
                    <td>{row.cac_khoan_khac}</td>
                    <td>{row.tong_cong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="alert alert-danger mx-2 my-2" role="alert">
            Không có dữ liệu. Vui lòng kiểm tra dữ liệu bắt đầu từ Hàng số 9
          </div>
        )}
      </>
    );
  };

  //
  // ==============================<>========================================
  //

  const [dotLuong, setDotLuong] = useState([]); //Lấy theo tháng
  const [isDotLuong, setIsDotLuong] = useState([]); //Lấy theo tên đợt
  const [isLuongByIdDotCT, setIsLuongByIdDotCT] = useState([]); //Lấy theo id đợt CT
  const [isLuongByIdDotCN, setIsLuongByIdDotCN] = useState([]); //Lấy theo id đợt CN

  // Lấy dữ liệu đợt lương bằng tháng
  const DotLuong = async () => {
    if (updateSalaryData.month) {
      try {
        const formattedMonth = moment(updateSalaryData.month).format("MM-YYYY");
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

  const DotLuongByName = async () => {
    const periodName = updateSalaryData.periodName;
    if (!periodName) return null;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dotluong/${periodName}`
      );
      setIsDotLuong(response.data);
      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
      setIsDotLuong([]);
      return null;
    }
  };

  // Lấy dữ liệu đợt lương bằng id dot
  const isDotLuongByIdDot = async (dotLuong) => {
    if (!dotLuong || !dotLuong.id || !dotLuong.loai_phieu) return;

    const endpoint = dotLuong.loai_phieu === "1" ? "chitrong" : "chingoai";
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${endpoint}/id_dot/${dotLuong.id}`
      );
      if (dotLuong.loai_phieu === "1") {
        setIsLuongByIdDotCT(response.data);
      } else {
        setIsLuongByIdDotCN(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đợt lương:", error);
      if (dotLuong.loai_phieu === "1") {
        setIsLuongByIdDotCT([]);
      } else {
        setIsLuongByIdDotCN([]);
      }
    }
  };

  // Hàm chính để gọi các hàm fetch data
  const fetchData = async () => {
    await DotLuong(); // Fetch đợt lương theo tháng
    const dotLuong = await DotLuongByName();
    if (dotLuong) {
      setUpdateSalaryData((prev) => ({
        ...prev,
        templateName: dotLuong.loai_phieu,
      }));
      await isDotLuongByIdDot(dotLuong);
    }
  };

  // Gọi fetchData trong useEffect
  useEffect(() => {
    fetchData();
  }, [updateSalaryData.month, updateSalaryData.periodName, API_BASE_URL]);

  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateSalarySubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true); // Bắt đầu loading

    try {
      const totalSeconds = maxViewTime * 60;
      const formattedTime = moment.utc(totalSeconds * 1000).format("HH:mm:ss");

      const dotLuong = {
        time_start: moment(updateSalaryData.time_start).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end: moment(updateSalaryData.time_end).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_xem: formattedTime,
        time_start_ql: moment(updateSalaryData.time_start_ql).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
        time_end_ql: moment(updateSalaryData.time_end_ql).format(
          "yyyy/MM/DD HH:mm:ss"
        ),
      };

      console.log("updateSalaryData", updateSalaryData);
      const updateDot = await axios.put(
        `${API_BASE_URL}/dotluong/${isDotLuong.id}`,
        {
          dotLuong,
        }
      );
      console.log(
        "Dữ liệu đợt lương đã được cập nhật vào CSDL:",
        updateDot.data
      );

      const updatePhanQuyenSalary = await axios.put(
        `${API_BASE_URL}/phanquyen/phongban/phan-quyen-salary/${isDotLuong.id}`,
        {
          id_dot: isDotLuong.id,
          phanQuyenSalary: updateSalaryData.PhanQuyenSalary,
        }
      );

      // Kiểm tra xem có file được tải lên không
      if (updateSalaryData.file) {
        let dataToUpdate;
        if (updateSalaryData.templateName === "1") {
          dataToUpdate = isLuongByIdDotCT;
        } else if (updateSalaryData.templateName === "2") {
          dataToUpdate = isLuongByIdDotCN;
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

        // Chỉ gửi các item có dữ liệu
        const data = filteredData.filter(
          (item) => Object.keys(item).length > 0
        );

        if (data.length === 0) {
          toast.warning("Không có dữ liệu hợp lệ để cập nhật.");
          return;
        }

        const endpoint =
          updateSalaryData.templateName === "1"
            ? "chitrong/savechitrong"
            : "chingoai/savechingoai";
        const response = await axios.put(`${API_BASE_URL}/${endpoint}`, {
          data,
          id_dot: isDotLuong.id,
        });
        toast.success("Cập nhật dữ liệu đợt lương và chi tiết thành công!");
      } else {
        toast.success("Cập nhật thông tin đợt lương thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu vào CSDL:", error);
      toast.error("Có lỗi xảy ra khi cập nhật dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false); // Kết thúc loading
    }
  };

  // Trong useEffect khi lấy dữ liệu isDotLuong
  useEffect(() => {
    if (isDotLuong) {
      setUpdateSalaryData((prev) => ({
        ...prev,
        time_start: isDotLuong.time_start
          ? new Date(isDotLuong.time_start)
          : null,
        time_end: isDotLuong.time_end ? new Date(isDotLuong.time_end) : null,
      }));
    }
  }, [isDotLuong]);

  // Sửa đổi handleUpdateSalaryChange
  const handleUpdateSalaryChange = (name, value) => {
    setUpdateSalaryData((prev) => {
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
          let startRow, filteredData;

          if (updateSalaryData.templateName === "1") {
            // Chi Trong
            startRow = 0; // Bắt đầu từ hàng số 1
            filteredData = [];

            for (let i = startRow; i < result.data.length; i++) {
              const row = result.data[i];

              // Kiểm tra nếu cột 1 không phải là số nguyên thì dừng lại
              if (Number.isInteger(Number(row[0])) && row[0] !== "") {
                const parseFloatSafe = (value) => {
                  if (
                    value === undefined ||
                    value === null ||
                    value.trim() === ""
                  ) {
                    return 0;
                  }
                  const parsed = parseFloat(value);
                  return isNaN(parsed) ? 0 : parsed;
                };

                const gcptg = parseFloatSafe(row[6]) + parseFloatSafe(row[7]);

                filteredData.push({
                  ma_nv: row[2], // Column3
                  ho_ten: row[3], // Column4
                  to_in_luong: row[42], // Column43
                  ma_so_thue: row[1], // Column2
                  muc_luong_hd: row[4], // Column5
                  gio_cong_thuc_te: row[9], // Column10
                  gio_cong_T7_CN_CT: row[11], // Column12
                  gio_cong_ngay_thuong: row[12], // Column13
                  gio_cong_nghi: row[13], // Column14
                  gio_cong_phep_thoi_gian: gcptg ? gcptg : 0,
                  gio_cong_huan_luyen: row[10], // Column11
                  luong_tg_phep: row[5], // Column6
                  luong_truc_tiep: row[14], // Column15
                  luong_gian_tiep: row[15], // Column16
                  phu_cap_lam_dem: row[16], // Column17
                  luong_lam_them_ngay_thuong: row[17], // Column18
                  luong_lam_them_ngay_nghi: row[18], // Column19
                  thuong_kpi_san_xuat: row[19], // Column20
                  thuong_cb_nv_gioi: row[20], // Column21
                  phu_cap_kiem_viec: row[21], // Column22
                  phu_cap_con_nho: row[22], // Column23
                  phu_cap_di_lai_xang_xe: row[23], // Column24
                  phu_cap_tien_an: row[24], // Column25
                  thuong_hoan_thanh_kh_thang: row[25], // Column26
                  thuong_hoan_thanh_kh_ngay: row[26], // Column27
                  bo_sung_tron_so_chi_tien_mat: row[28], // Column29
                  cac_khoan_khac: row[27], // Column28
                  tong_cong: row[29], // Column30
                  thue_thu_nhap: row[30], // Column31
                  bao_hiem: row[31], // Column32
                  thu_hoi_phep: row[32], // Column33
                  thuc_lanh: row[33], // Column34
                });
              } else {
                continue;
              }
            }
          } else if (updateSalaryData.templateName === "2") {
            // Chi Ngoài
            startRow = 0; // Bắt đầu từ hàng số 7
            filteredData = [];

            for (let i = startRow; i < result.data.length; i++) {
              const row = result.data[i];
              if (Number.isInteger(Number(row[0])) && row[0] !== "") {
                filteredData.push({
                  ma_nv: row[1],
                  ho_ten: `${row[2]} ${row[3]}`,
                  gio_cong_lam_them_nt: row[12],
                  gio_cong_lam_them_nn: row[14],
                  phu_cap_dem: row[18],
                  lam_them_nt: row[13],
                  lam_them_nn: row[15],
                  thuong_ksnx_ngay_thuong: row[11],
                  tien_xe: row[17],
                  tien_an: row[16],
                  bo_sung_so_cho_tien_mat: row[20],
                  cac_khoan_khac: row[19],
                  tong_cong: row[21],
                });
              }
            }
          } else {
            toast.warning("Template không hợp lệ");
            return;
          }

          console.log(filteredData);

          const updateState = (prevData) => {
            const updatedData = [...prevData];
            for (const newItem of filteredData) {
              if (newItem && newItem.ma_nv) {
                const normalizedNewId = newItem.ma_nv
                  .replace(/^LH/, "")
                  .slice(-5);
                const index = updatedData.findIndex(
                  (item) =>
                    item.ma_nv.replace(/^LH/, "").slice(-5) === normalizedNewId
                );
                if (index !== -1) {
                  // Cập nhật dữ liệu hiện có
                  updatedData[index] = {
                    ...updatedData[index],
                    ...newItem,
                    ma_nv: normalizedNewId,
                  };
                } else {
                  // Thêm dữ liệu mới nếu không tìm thấy ma_nv
                  updatedData.push({ ...newItem, ma_nv: normalizedNewId });
                }
              } else {
                toast.warning("Dòng dữ liệu không hợp lệ:", newItem);
              }
            }
            return updatedData;
          };

          if (updateSalaryData.templateName === "1") {
            setIsLuongByIdDotCT((prevData) => {
              return updateState(prevData);
            });
          } else if (updateSalaryData.templateName === "2") {
            setIsLuongByIdDotCN((prevData) => {
              return updateState(prevData);
            });
          }
        },
      });
    } else {
      // Xử lý khi không có file được chọn (ví dụ: người dùng hủy chọn file)
      toast.warning("Không có file được chọn");
      // Có thể thêm logic để xóa dữ liệu đã parse trước đó nếu cần
      if (updateSalaryData.templateName === "1") {
        setIsLuongByIdDotCT([]);
      } else if (updateSalaryData.templateName === "2") {
        setIsLuongByIdDotCN([]);
      }
    }
  };

  // Hàm chuyển đổi từ 'HH:MM:SS' sang số phút
  const timeStringToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
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

  // Trong component của bạn
  let [maxViewTime, setMaxViewTime] = useState();
  useEffect(() => {
    setMaxViewTime(timeStringToMinutes(isDotLuong.time_xem));
  }, [isDotLuong.time_xem]);

  // Phân quyền

  const handlePhongbanData = (data) => {
    if (activeTab === "new") {
      setNewSalaryData((prev) => ({
        ...prev,
        PhanQuyenSalary: data,
      }));
    } else if (activeTab === "update") {
      setUpdateSalaryData((prevState) => ({
        ...prevState,
        PhanQuyenSalary: data,
      }));
    }
  };
  return (
    <div className="container-fluid p-0 pe-2 pe-md-0">
      <h1 className="h3 mb-3">
        <strong>Tải lên</strong> bảng lương
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
            Tải mới bảng lương
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link p-3 size-1 ${
              activeTab === "update" ? "active" : ""
            }`}
            onClick={() => setActiveTab("update")}
          >
            Cập nhật bảng lương
          </button>
        </li>
      </ul>

      <div className="tab-content bg-tab" id="myTabContent">
        {activeTab === "new" && (
          <div className="tab-pane fade show active" role="tabpanel">
            <div className="container-fluid py-3">
              <h4 className="text-center mb-4 text-primary h2 fw-bold">
                THÔNG TIN THÊM BẢNG LƯƠNG
              </h4>
              <form
                onSubmit={handleNewSalarySubmit}
                className="needs-validation"
              >
                <div className="row">
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative w-100">
                      <label htmlFor="new-month-salary" className="form-label">
                        Bảng lương tháng
                      </label>
                      <DatePicker
                        selected={newSalaryData.month}
                        onChange={(date) =>
                          handleNewSalaryChange("month", date)
                        }
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="form-control w-auto"
                        id="new-month-salary"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label htmlFor="new-period-name" className="form-label">
                        Tên đợt lương
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="new-period-name"
                        value={newSalaryData.periodName}
                        onChange={(e) =>
                          handleNewSalaryChange("periodName", e.target.value)
                        }
                        placeholder="Đợt 1 tháng 8/24"
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label htmlFor="new-payment-date" className="form-label">
                        Ngày thanh toán
                      </label>
                      <DatePicker
                        selected={newSalaryData.paymentDate}
                        onChange={(date) =>
                          handleNewSalaryChange("paymentDate", date)
                        }
                        dateFormat="dd/MM/YYYY"
                        className="form-control"
                        id="new-payment-date"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-salary"
                        className="form-label"
                      >
                        Thời gian cho CNV xem lương
                      </label>
                      <RangeDateTimePicker
                        onChange={(update) =>
                          handleNewSalaryChange("viewRange", update)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-salary"
                        className="form-label"
                      >
                        Thời gian cho Quản lý xem
                      </label>
                      <RangeDateTimePicker
                        onChange={(update) =>
                          handleNewSalaryChange("viewRangeQL", update)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-max-time-view-salary"
                        className="form-label"
                      >
                        Số phút tối đa xem lương
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="new-max-time-view-salary"
                        value={newSalaryData.maxViewTime}
                        onChange={(e) =>
                          handleNewSalaryChange(
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
                      <label htmlFor="new-template-name" className="form-label">
                        Tên mẫu file
                      </label>
                      <select
                        className="form-select"
                        id="new-template-name"
                        value={newSalaryData.templateName}
                        onChange={(e) =>
                          handleNewSalaryChange("templateName", e.target.value)
                        }
                        required
                        disabled={newSalaryData.templateName} // Disable if file is uploaded
                      >
                        <option value="">Chọn mẫu file</option>
                        <option value="1">Mẫu đầy đủ</option>
                        <option value="2">Mẫu rút gọn</option>
                      </select>
                    </div>
                  </div>
                  {newSalaryData.templateName && (
                    <div className="col-sm-6 col-lg-4">
                      <div className="mb-3 position-relative">
                        <label htmlFor="new-file-salary" className="form-label">
                          File CSV lương
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          id="new-file-salary"
                          onChange={(e) =>
                            handleNewSalaryChange(
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
                  <PhongbanPhanquyen
                    onSubmit={(data) => {
                      handlePhongbanData(data);
                    }}
                    activeTab={activeTab}
                  />
                </div>
                <div className="row justify-content-center">
                  <div className="col-sm-6 col-md-4 text-center">
                    <button
                      type="submit"
                      className="btn btn-primary"
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
                        "Thêm bảng lương"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === "update" && (
          <div className="tab-pane fade show active" role="tabpanel">
            <div className="container-fluid py-3">
              <h4 className="text-center mb-4 text-primary h2 fw-bold">
                THÔNG TIN CẬP NHẬT BẢNG LƯƠNG
              </h4>
              <form
                onSubmit={handleUpdateSalarySubmit}
                className="needs-validation"
              >
                <div className="row">
                  <div className="col-sm-6 col-lg-4">
                    <div class="mb-3 position-relative">
                      <label
                        htmlFor="update-month-salary"
                        className="form-label"
                      >
                        Bảng lương tháng
                      </label>
                      <DatePicker
                        selected={updateSalaryData.month}
                        onChange={(date) =>
                          handleUpdateSalaryChange("month", date)
                        }
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="form-control"
                        id="update-month-salary"
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
                        Tên đợt lương
                      </label>
                      <select
                        className="form-select"
                        id="update-period-name"
                        value={updateSalaryData.periodName}
                        onChange={(e) =>
                          handleUpdateSalaryChange("periodName", e.target.value)
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

                      <div className="invalid-tooltip">
                        Vui lòng chọn đợt lương.
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-payment-date"
                        className="form-label"
                      >
                        Ngày thanh toán
                      </label>
                      <DatePicker
                        selected={isDotLuong.ngay_thanh_toan}
                        onChange={(date) =>
                          handleUpdateSalaryChange("paymentDate", date)
                        }
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                        id="update-payment-date"
                        required
                      />
                      <div className="invalid-tooltip">
                        Vui lòng chọn ngày thanh toán
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="new-range-date-view-salary"
                        className="form-label"
                      >
                        Thời gian cho CNV xem lương
                      </label>

                      <RangeDateTimePicker
                        startDate={updateSalaryData.time_start}
                        endDate={updateSalaryData.time_end}
                        onChange={(update) => {
                          console.log("DateRange updated:", update);
                          handleUpdateSalaryChange("viewRange", {
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
                        htmlFor="new-range-date-view-salary"
                        className="form-label"
                      >
                        Thời gian cho Quản lý xem lương
                      </label>

                      <RangeDateTimePicker
                        startDate={isDotLuong.time_start_ql}
                        endDate={isDotLuong.time_end_ql}
                        onChange={(update) => {
                          console.log("DateRange updated:", update);
                          handleUpdateSalaryChange("viewRangeQL", {
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
                        value={updateSalaryData.templateName}
                        onChange={(e) =>
                          handleUpdateSalaryChange(
                            "templateName",
                            e.target.value
                          )
                        }
                        disabled
                        required
                      >
                        <option value="">Chọn mẫu file</option>
                        <option value="1">Mẫu đầy đủ</option>
                        <option value="2">Mẫu rút gọn</option>
                      </select>
                      <div className="invalid-tooltip">
                        Vui lòng chọn mẫu file.
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-4">
                    <div className="mb-3 position-relative">
                      <label
                        htmlFor="update-max-time-view-salary"
                        className="form-label"
                      >
                        Số phút tối đa xem lương
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="update-max-time-view-salary"
                        value={maxViewTime}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          setMaxViewTime(newValue);
                          handleUpdateSalaryChange(
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
                        htmlFor="update-file-salary"
                        className="form-label"
                      >
                        File CSV lương
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="update-file-salary"
                        onChange={handleFileUpload}
                        accept=".csv"
                      />
                      <div className="invalid-tooltip">
                        Vui lòng chọn file csv
                      </div>
                    </div>
                  </div>
                </div>
                <PhongbanPhanquyen
                  onSubmit={handlePhongbanData}
                  activeTab={activeTab}
                  initialData={isDotLuong.id}
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
                        "Cập nhật bảng lương"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === "new" && (
          <>
            {newSalaryData.templateName &&
              newSalaryData.parsedData &&
              newSalaryData.parsedData.length > 0 && (
                <>
                  {newSalaryData.templateName === "2"
                    ? renderSalaryTableD2(newSalaryData.parsedData)
                    : newSalaryData.templateName === "1"
                    ? renderSalaryTableD1(newSalaryData.parsedData)
                    : null}
                </>
              )}
          </>
        )}
        {activeTab === "update" && (
          <>
            {updateSalaryData.templateName && updateSalaryData.parsedData && (
              <>
                {updateSalaryData.templateName === "2"
                  ? renderSalaryTableD2(isLuongByIdDotCN)
                  : updateSalaryData.templateName === "1"
                  ? renderSalaryTableD1(isLuongByIdDotCT)
                  : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UploadSalary;
