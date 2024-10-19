import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigationWarningContext } from "./NavigationWarningContext";

export const useNavigationWarning = (getData, API_BASE_URL) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showWarning, setShowWarning, warningData, setWarningData } =
    useNavigationWarningContext();

  const handleBeforeUnload = useCallback(
    (event) => {
      if (showWarning) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    [showWarning]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  useEffect(() => {
    const unlisten = navigate((nextLocation) => {
      if (nextLocation.pathname !== location.pathname && showWarning) {
        if (window.confirm("Bạn có chắc chắn muốn rời khỏi trang này?")) {
          const data = getData();
          if (data) {
            axios
              .post(`${API_BASE_URL}/statusLuong`, [data])
              .then(() =>
                console.log("Dữ liệu đã được gửi thành công khi chuyển trang")
              )
              .catch((error) => console.error("Lỗi khi gửi dữ liệu:", error));
          }
          setShowWarning(false);
          setWarningData(null);
          return true;
        }
        return false;
      }
      return true;
    });

    return unlisten;
  }, [
    navigate,
    location,
    showWarning,
    getData,
    API_BASE_URL,
    setShowWarning,
    setWarningData,
  ]);

  return { setShowWarning, setWarningData };
};
