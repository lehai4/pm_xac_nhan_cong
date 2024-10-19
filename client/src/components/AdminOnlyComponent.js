import React from "react";
import { useAuth } from "../hooks/useAuth";

const AdminOnlyComponent = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  return <div>{/* Nội dung chỉ dành cho admin */}</div>;
};

export default AdminOnlyComponent;
