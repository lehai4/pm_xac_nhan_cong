import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { API_BASE_URL } from "../../config/api";
import { FaCheck } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { FcFeedback, FcOk } from "react-icons/fc";
import { getDaysInMonth, formatNumber } from "../../utils";
import BangCong from "./BangCong";

const TEST2 = () => {
  const ma_nv = localStorage.getItem("ma_nv");
  const [currentTable, setCurrentTable] = useState(1); // Theo dõi bảng hiện đang hiển thị
  const [congData, setCongData] = useState([]); // Dữ liệu bảng chính
  const [thuongData, setThuongData] = useState([]); // Dữ liệu bảng hệ số thưởng
  const [gianCaData, setGianCaData] = useState([]); // Dữ liệu bảng giờ giãn ca

  const [dateInput, setDateInput] = useState(""); // Chuỗi chứa tháng và năm
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dotCongHST, setDotCongHST] = useState(null);
  const [dotCongGCGC, setDotCongGCGC] = useState(null);
  const [dotCongMain, setDotCongMain] = useState(null);
  const [showDetails, setShowDetails] = useState(false); // Trạng thái để điều khiển hiển thị chi tiết
  const [timeStartHST, setTimeStartHST] = useState(null);
  const [timeEndHST, setTimeEndHST] = useState(null);
  const [timeStartGCGC, setTimeStartGCGC] = useState(null);
  const [timeEndGCGC, setTimeEndGCGC] = useState(null);
  const [timeStartMain, setTimeStartMain] = useState(null);
  const [timeEndMain, setTimeEndMain] = useState(null);
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
              setThuongData(HST);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${HST.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              setDotCongHST(dotCong);
              // setCountdownHST(dotCong.time_xem);
              setTimeStartHST(new Date(dotCong.time_start));
              setTimeEndHST(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu HST:", error);
            setThuongData(null);
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
              setGianCaData(GCGC);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${GCGC.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              setDotCongGCGC(dotCong);
              // setCountdownGCGC(dotCong.time_xem);
              setTimeStartGCGC(new Date(dotCong.time_start));
              setTimeEndGCGC(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu GCGC:", error);
            setGianCaData(null);
            setDotCongGCGC(null);
            // setCountdownGCGC(null);
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
              setCongData(Main);

              const dotCongResponse = await axios.get(
                `${API_BASE_URL}/dotcong/${Main.id_dot_cong}`
              );
              const dotCong = dotCongResponse.data;

              setDateInput(dotCong.bang_cong_t);
              setDotCongMain(dotCong);
              // setCountdownMain(dotCong.time_xem);
              setTimeStartMain(new Date(dotCong.time_start));
              setTimeEndMain(new Date(dotCong.time_end));
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Bảng công chính:", error);
            setCongData(null);
            setDotCongMain(null);
            // setCountdownMain(null);
          }
        };

        // Thực hiện cả hai fetch cùng lúc
        await Promise.all([fetchHST(), fetchGCGC(), fetchMain()]);

        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể lấy dữ liệu công");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ma_nv, API_BASE_URL]);

  const handleNextTable = () => {
    if (currentTable === 1) {
      setCurrentTable(2);
    } else if (currentTable === 2) {
      setCurrentTable(3);
    }
  };
  const isWithinViewingPeriodMain = () => {
    const now = new Date();
    return now >= timeStartMain && now <= timeEndMain;
  };

  const isWithinViewingPeriodGCGC = () => {
    const now = new Date();
    return now >= timeStartGCGC && now <= timeEndGCGC;
  };
  const isWithinViewingPeriodHST = () => {
    const now = new Date();
    return now >= timeStartHST && now <= timeEndHST;
  };
  return (
    <div>
      {currentTable === 1 && (
        <BangCong
          data={congData}
          timeStartMain={timeStartMain}
          timeEndMain={timeEndMain}
          dateInput={dateInput}
          currentTable={currentTable}
          onNext={handleNextTable}
          showDetails={showDetails}
          isWithinViewingPeriodMain={isWithinViewingPeriodMain}
        />
      )}
      {currentTable === 2 && (
        <BangCong
          data={thuongData}
          timeStartHST={timeStartHST}
          timeEndHST={timeEndHST}
          dateInput={dateInput}
          currentTable={currentTable}
          showDetails={showDetails}
          onNext={handleNextTable}
          isWithinViewingPeriodHST={isWithinViewingPeriodHST}
        />
      )}
      {currentTable === 3 && (
        <BangCong
          data={gianCaData}
          dateInput={dateInput}
          timeStartGCGC={timeStartGCGC}
          timeEndGCGC={timeEndGCGC}
          showDetails={showDetails}
          currentTable={currentTable}
          onNext={handleNextTable}
          isWithinViewingPeriodGCGC={isWithinViewingPeriodGCGC}
        />
      )}
    </div>
  );
};

export default TEST2;
