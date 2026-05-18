require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const passport = require("./config/passport");

const authRoutes     = require("./routes/authRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const courseRoutes   = require("./routes/courseRoutes");
const roomRoutes     = require("./routes/roomRoutes");

const { authenticate } = require("./middleware/auth");

const app = express();

// ─── CORS — must be before all routes ────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://class-scheduling-generation.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(passport.initialize());

// ─── Public routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Protected routes ────────────────────────────────────────────────────────
app.use("/api/schedules", authenticate, scheduleRoutes);
app.use("/api/courses",   authenticate, courseRoutes);
app.use("/api/rooms",     authenticate, roomRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
  try {
    const pool = require("./config/db");
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "OK", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "DB connection failed", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  console.log(`GOOGLE_CLIENT_ID set: ${!!process.env.GOOGLE_CLIENT_ID}`);
});
