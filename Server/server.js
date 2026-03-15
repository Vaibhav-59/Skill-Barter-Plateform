const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const socketController = require("./sockets/socketController");
const errorHandler = require("./middleware/error");
const { checkInactiveUsers } = require("./utils/inactiveUserHandler");
const startCronJobs = require("./utils/cronScheduler");

dotenv.config();
// Load env vars

// Env Check
const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "SMTP_HOST",
  "SMTP_EMAIL",
  "SMTP_PASSWORD",
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

connectDB();

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔥 MAKE IO INSTANCE AVAILABLE TO ALL CONTROLLERS
app.set('io', io);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/schedules", require("./routes/schedules"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/mentor", require("./routes/mentor"));
app.use("/api/sessions", require("./routes/sessionRoutes"));


// Test route
app.get("/", (req, res) => {
  res.send("SkillBarter API is running...");
});

// Global Error Handler
app.use(errorHandler);

// Socket setup
socketController(io);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(
    `🚀 Hello, Future Billionaire! Your server is running on port ${PORT}`
  );
  console.log(`📱 Socket.IO server ready for connections`);
  
  // Start cron jobs
  startCronJobs(app);
  
  // Run inactive user check every day at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      checkInactiveUsers();
    }
  }, 60000);
  
  // Also run once on startup
  setTimeout(() => {
    checkInactiveUsers();
  }, 5000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});