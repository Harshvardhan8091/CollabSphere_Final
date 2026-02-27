"use strict";

const express = require("express");
const { SavedBoardController } = require("../controllers");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/save", protect, SavedBoardController.saveBoard);
router.get("/", protect, SavedBoardController.getSavedBoards);
router.get("/:boardId", protect, SavedBoardController.getSavedBoard);
router.put("/:boardId", protect, SavedBoardController.updateSavedBoard);
router.delete("/:boardId", protect, SavedBoardController.deleteSavedBoard);

module.exports = router;
