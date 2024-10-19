import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isQL: false,
    isTT: false,
    isSUPER: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setAuthState({
          isAuthenticated: true,
          isAdmin: decodedToken.role === "admin",
          isQL: decodedToken.roleAll === "QL",
          isTT: decodedToken.roleAll === "TT",
          isSUPER: decodedToken.isSUPER,
        });
      } catch (error) {
        localStorage.removeItem("token");
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isQL: false,
          isTT: false,
          isSUPER: false,
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isQL: false,
        isTT: false,
        isSUPER: false,
      });
    }
  }, []);

  return authState;
};