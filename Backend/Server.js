require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const outdoorRoutes = require("./routes/outdoorRoutes");
const indoorRoutes = require("./routes/indoorRoutes");
const openaiKey = process.env.OPENAI_API_KEY;
const app = express();

connectDB();

app.use(cors(
  origin : "*",
  methods : ["GET","POST",]
));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/outdoor", outdoorRoutes);
app.use("/api/indoor", indoorRoutes);

app.get("/", (req, res) => {
  res.send("🌍 Vibe2Go Backend Running");
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
