require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const outdoorRoutes = require("./routes/outdoorRoutes");
const indoorRoutes = require("./routes/indoorRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS (correct syntax)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

// Parse JSON
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/outdoor", outdoorRoutes);
app.use("/api/indoor", indoorRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🌍 Vibe2Go Backend Running");
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
