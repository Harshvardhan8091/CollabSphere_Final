"use strict";

const mongoose = require("mongoose");

const savedBoardSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      default: "Untitled Board"
    },
    thumbnail: {
      type: String, // Base64 image data
      default: null
    },
    canvasData: {
      type: Array,
      default: []
    },
    roomId: {
      type: String,
      default: null
    },
    participantsCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const SavedBoard = mongoose.model("SavedBoard", savedBoardSchema);

module.exports = SavedBoard;
