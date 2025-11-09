import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables as early as possible
dotenv.config({ debug: process.env.DEBUG });
import { dirname } from 'path';
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
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

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
app.use(cors({
  origin: process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(rateLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/measurements", measurementsRoutes); // Measurements routes

// Production static file serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start server with Socket.IO
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});