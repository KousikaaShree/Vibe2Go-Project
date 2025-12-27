import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("token");

  return isAuthenticated ? (
    <>
      <Navbar />
      <div style={{ paddingTop: "80px" }}>
        <Outlet />
      </div>
    </>
  ) : (
    <Navigate to="/login" />
  );
}
