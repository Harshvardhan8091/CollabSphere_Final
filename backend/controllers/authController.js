"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const JWT_EXPIRES_IN = "7d";

const generateToken = (userId, role) => {
  const secret = getJwtSecret();
  return jwt.sign({ id: userId, role }, secret, { expiresIn: JWT_EXPIRES_IN });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      res.status(409);
      throw new Error("Email is already registered");
    }
    const user = await User.create({ name: name.trim(), email: trimmedEmail, password, role });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      res.status(401);
      throw new Error("This account was created using Google. Please sign in with Google.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    const token = generateToken(user._id, user.role);
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Logged out successfully. Please remove the token on the client side."
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout };
