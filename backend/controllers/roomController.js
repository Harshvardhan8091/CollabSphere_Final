"use strict";

const { v4: uuidv4 } = require("uuid");
const { Room } = require("../models");

const createRoom = async (req, res, next) => {
  try {
    const roomId = uuidv4();
    const userId = req.user._id.toString();
    const room = await Room.create({
      roomId,
      host: userId,
      participants: [{ userId, role: "host" }]
    });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      res.status(400);
      throw new Error("roomId is required");
    }
    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }
    const userId = req.user._id.toString();
    const alreadyJoined = room.participants.some(
      (p) => p.userId === userId
    );
    if (!alreadyJoined) {
      room.participants.push({ userId, role: "editor" });
      await room.save();
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
};

const getRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
};

const getRecentSessions = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    
    // Find rooms where user is a participant
    const rooms = await Room.find({
      'participants.userId': userId
    })
    .select('roomId participants createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10);

    // Format response
    const recentSessions = rooms.map(room => ({
      roomId: room.roomId,
      lastUpdated: room.updatedAt || room.createdAt,
      participantsCount: room.participants.length,
      createdAt: room.createdAt
    }));

    res.json(recentSessions);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoomDetails,
  getRecentSessions
};
