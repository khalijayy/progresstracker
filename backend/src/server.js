import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from "path";
import fs from "fs";

// Load environment variables as early as possible
dotenv.config({ debug: process.env.DEBUG });
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import measurementsRoutes from "./routes/measurementsRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

// Debug: Print loaded environment variables (excluding sensitive data)
console.log('Environment Variables Loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI ? '✓ Set' : '✗ Missing',
  JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
});

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is required but not set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is required but not set');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5001;
// resolve root if needed (not used below since we use __dirname)
// Create HTTP server for Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
if(process.env.NODE_ENV==="production"){
app.use(cors({
  origin: process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
}
app.use(express.json());
app.use(rateLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/measurements", measurementsRoutes); // Measurements routes

// Static file serving for frontend build (frontend/dist).
// `__dirname` is backend/src, so frontend is two levels up: ../../frontend/dist
const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");
const indexHtml = path.join(frontendDist, "index.html");

if (fs.existsSync(frontendDist) && fs.existsSync(indexHtml)) {
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  console.warn(`Frontend build not found at ${frontendDist}. If you expect the frontend to be served by this server, run the frontend build (e.g. in the project root: 'cd frontend && npm run build').`);
}


// Start server with Socket.IO
connectDB().then(() => {
  // Attach a friendly error handler before attempting to listen
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`ERROR: Port ${PORT} is already in use. Ensure no other process is listening on this port or change PORT in your environment.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});