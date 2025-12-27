import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex overflow-hidden p-0">
       {/* Left Side - Image & Branding */}
       <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{ 
          background: "linear-gradient(135deg, #264653 0%, #2A9D8F 100%)",
          position: "relative"
        }}
      >
        <h1 className="display-3 fw-bold mb-3">Welcome Back!</h1>
        <p className="lead text-center px-5">
          Ready to find your next adventure? Log in to continue your journey.
        </p>
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="col-md-6 d-flex align-items-center justify-content-center bg-white">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-5 w-75"
          style={{ maxWidth: "500px", background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
        >
          <h2 className="text-center mb-4 text-dark">Member Login</h2>

          <div className="input-group mb-3">
            <span className="input-group-text bg-light border-0"><FaEnvelope className="text-secondary"/></span>
            <input 
              className="form-control bg-light border-0 py-3"
              placeholder="Email Address"
              onChange={e=>setForm({...form,email:e.target.value})} 
            />
          </div>

          <div className="input-group mb-4">
            <span className="input-group-text bg-light border-0"><FaLock className="text-secondary"/></span>
            <input 
              type="password" 
              className="form-control bg-light border-0 py-3"
              placeholder="Password"
              onChange={e=>setForm({...form,password:e.target.value})} 
            />
          </div>

          <button className="btn btn-primary w-100 py-3 mb-3 shadow-sm d-flex justify-content-center align-items-center gap-2" onClick={submit}>
            <FaSignInAlt /> Login
          </button>

          <p className="text-center mt-4 text-muted">
            New here? 
            <span className="text-primary fw-bold ms-2 cursor-pointer" onClick={()=>navigate("/")}>
              Create Account
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
