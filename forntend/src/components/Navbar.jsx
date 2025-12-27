import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHome } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="container">
        <Link className="navbar-brand fw-bold text-gradient" to="/dashboard" style={{ fontSize: "1.5rem" }}>
          Vibe2Go 🌍
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-3 align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/dashboard"><FaHome /> Home</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-danger rounded-pill px-4" onClick={logout}>
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
