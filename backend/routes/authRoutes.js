"use strict";

const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { AuthController } = require("../controllers");
const { googleAuth } = require("../controllers/googleAuthController");
const protect = require("../middleware/protect");

const router = express.Router();

// Regular auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Google OAuth with google-auth-library (for frontend token verification)
router.post("/google", googleAuth);

// Passport Google OAuth routes (for redirect flow)
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: process.env.FRONTEND_URL || "http://localhost:5173",
    session: false 
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// Protected route: returns current user (requires Bearer token)
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
