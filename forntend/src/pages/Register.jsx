import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

export default function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      alert("Registration failed. Try again.");
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
          background: "linear-gradient(135deg, #2A9D8F 0%, #264653 100%)",
          position: "relative"
        }}
      >
        <h1 className="display-3 fw-bold mb-3">Vibe2Go 🌍</h1>
        <p className="lead text-center px-5">
          Plan your day the way you feel. Discover spots, experiences, and vibes curated just for you.
        </p>
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "300px", height: "300px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", top: "-5%", right: "-5%", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="col-md-6 d-flex align-items-center justify-content-center bg-white position-relative">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass-card p-5 w-75"
          style={{ maxWidth: "500px", background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
        >
          <h2 className="text-center mb-4 text-dark">Create Account</h2>
          
          <div className="input-group mb-3">
            <span className="input-group-text bg-light border-0"><FaUser className="text-secondary"/></span>
            <input 
              className="form-control bg-light border-0 py-3"
              placeholder="Full Name"
              onChange={e=>setForm({...form,name:e.target.value})} 
            />
          </div>

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
            Sign Up <FaArrowRight />
          </button>

          <p className="text-center mt-4 text-muted">
            Already have an account? 
            <span className="text-primary fw-bold ms-2 cursor-pointer" onClick={()=>navigate("/login")}>
              Log In
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
