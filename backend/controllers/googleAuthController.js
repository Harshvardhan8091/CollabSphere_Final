"use strict";

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_EXPIRES_IN = "7d";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const generateToken = (userId, role) => {
  const secret = getJwtSecret();
  return jwt.sign({ id: userId, role }, secret, { expiresIn: JWT_EXPIRES_IN });
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!credential) {
      res.status(400);
      throw new Error("Google credential is required");
    }

    if (!googleClientId || googleClientId === "your-google-client-id-here") {
      res.status(400);
      throw new Error("Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in backend .env");
    }

    const client = new OAuth2Client(googleClientId);

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401);
      throw new Error("Invalid Google token payload");
    }
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: "user",
      });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ user, token });
  } catch (err) {
    if (res.statusCode >= 500) {
      console.error("Google Auth Error:", err);
    }
    next(err);
  }
};

module.exports = { googleAuth };
