"use strict";

const { SavedBoard } = require("../models");

const saveBoard = async (req, res, next) => {
  try {
    const { title, thumbnail, canvasData, roomId, participantsCount } = req.body;
    const userId = req.user._id.toString();

    // Validate required fields
    if (!canvasData || !Array.isArray(canvasData)) {
      res.status(400);
      throw new Error("canvasData is required and must be an array");
    }

    // Log for debugging
    console.log(`[SaveBoard] User: ${userId}, Title: ${title}, Canvas items: ${canvasData.length}`);

    const savedBoard = await SavedBoard.create({
      userId,
      title: title || "Untitled Board",
      thumbnail: thumbnail || null,
      canvasData,
      roomId: roomId || null,
      participantsCount: participantsCount || 1
    });

    console.log(`[SaveBoard] Success: Board ${savedBoard._id} saved`);

    res.status(201).json({
      message: "Board saved successfully",
      board: {
        _id: savedBoard._id,
        title: savedBoard.title,
        createdAt: savedBoard.createdAt,
        updatedAt: savedBoard.updatedAt
      }
    });
  } catch (err) {
    console.error('[SaveBoard] Error:', err.message);
    next(err);
  }
};

const getSavedBoards = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const boards = await SavedBoard.find({ userId })
      .select('title thumbnail roomId participantsCount createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json(boards);
  } catch (err) {
    next(err);
  }
};

const getSavedBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id.toString();

    const board = await SavedBoard.findOne({ _id: boardId, userId });

    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    res.json(board);
  } catch (err) {
    next(err);
  }
};

const deleteSavedBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id.toString();

    const board = await SavedBoard.findOneAndDelete({ _id: boardId, userId });

    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    res.json({ message: "Board deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const updateSavedBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id.toString();
    const { title, thumbnail, canvasData } = req.body;

    const board = await SavedBoard.findOne({ _id: boardId, userId });

    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    if (title) board.title = title;
    if (thumbnail) board.thumbnail = thumbnail;
    if (canvasData) board.canvasData = canvasData;

    await board.save();

    res.json({
      message: "Board updated successfully",
      board
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  saveBoard,
  getSavedBoards,
  getSavedBoard,
  deleteSavedBoard,
  updateSavedBoard
};
