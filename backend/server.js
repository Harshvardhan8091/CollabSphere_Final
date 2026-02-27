"use strict";

require("dotenv").config();

const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

const connectDB = require("./config/db");
const { initSocket } = require("./sockets");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ================= ENV CONFIG =================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set.");
}

if (!process.env.MONGO_URI) {
  console.warn("MONGO_URI is not set.");
}

// ================= DATABASE =================
connectDB();

// ================= CORS =================
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
};

app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '50mb' })); // Increase limit for thumbnails
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ================= SESSION & PASSPORT =================
app.use(
  session({
    secret: process.env.JWT_SECRET || 'collabsphere-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Serve static files from "public" using absolute path (must be BEFORE API routes & 404)
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
app.use("/api", require("./routes"));

// ================= 404 + ERROR =================
app.use(notFound);
app.use(errorHandler);

// ================= SERVER + SOCKET =================
const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Google OAuth Callback: ${process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'}`);
});

module.exports = { app, server, io };