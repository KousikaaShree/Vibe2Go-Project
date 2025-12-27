import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaTree, FaArrowRight } from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="container py-5">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-5"
      >
        <motion.h1 variants={itemVariants} className="display-4 fw-bold text-dark mb-3">
          Where does your <span className="text-gradient">Vibe</span> take you today?
        </motion.h1>
        <motion.p variants={itemVariants} className="lead text-muted">
          Choose your path and let us curate the perfect experience for you.
        </motion.p>
      </motion.div>

      <div className="row justify-content-center g-4">
        {/* Indoor Card */}
        <motion.div 
          className="col-md-5"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
        >
          <div 
            className="card glass-card h-100 border-0 text-center p-5 cursor-pointer position-relative overflow-hidden"
            onClick={() => navigate("/indoor")}
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)" }}
          >
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary p-4 mb-3" style={{ width: "100px", height: "100px" }}>
                <FaHome size={40} />
              </div>
            </div>
            <h2 className="mb-3">Stay Indoor 🏠</h2>
            <p className="text-muted mb-4">
              Cozy vibes, movies, board games, and fridge-raiding recipes. Perfect for a chill day in.
            </p>
            <button className="btn btn-outline-custom rounded-pill px-4">
              Explore Inside <FaArrowRight className="ms-2" />
            </button>
            <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "200px", height: "200px", background: "rgba(42, 157, 143, 0.1)", borderRadius: "50%" }}></div>
          </div>
        </motion.div>

        {/* Outdoor Card */}
        <motion.div 
          className="col-md-5"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
        >
          <div 
            className="card glass-card h-100 border-0 text-center p-5 cursor-pointer position-relative overflow-hidden"
            onClick={() => navigate("/outdoor")}
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)" }}
          >
            <div className="mb-4">
               <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-success p-4 mb-3" style={{ width: "100px", height: "100px" }}>
                <FaTree size={40} />
              </div>
            </div>
            <h2 className="mb-3">Go Outdoor 🌿</h2>
            <p className="text-muted mb-4">
              Discover hidden gems, scenic spots, and tasty bites around you. Adventure awaits!
            </p>
            <button className="btn btn-outline-custom rounded-pill px-4">
              Explore Outside <FaArrowRight className="ms-2" />
            </button>
            <div style={{ position: "absolute", top: "-20%", left: "-20%", width: "200px", height: "200px", background: "rgba(233, 196, 106, 0.1)", borderRadius: "50%" }}></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
