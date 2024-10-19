import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import socket from "../config/socketio";
import { Outlet } from "react-router-dom"; // Import Outlet from react-router-dom

function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prevState) => !prevState);
  };
  const ten_nv = localStorage.getItem("ten_nv");
  const ma_nv = localStorage.getItem("ma_nv");

  const handlerLogOut = async () => {
    socket.emit("logout");
    localStorage.clear();
    window.location.href = "/login";

    // try {
    //   const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
    //     ma_nv,
    //   });
    //   if (response.status === 200) {
    //     localStorage.clear();
    //     window.location.href = "/login";
    //   } else {
    //     console.error("Failed to log out");
    //   }
    // } catch (error) {
    //   console.error("Error during logout:", error);
    // }
  };

  return (
    <div className="wrapper">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />
      <div className="main w-100 h-100">
        <Navbar
          ten_nv={ten_nv}
          onToggleSidebar={toggleSidebar}
          handlerLogOut={handlerLogOut}
          ma_nv={ma_nv}
        />
        <main className="content w-100 h-100">
          <div className="container-fluid p-0">
            <Outlet /> {/* Render nested routes here */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
