import express from "express";
import {
  createWatchman,
  getWatchmans,
  updateWatchman,
  deleteWatchman,
} from "../controllers/adminwatchmanController.js";

const router = express.Router();

// Only use relative paths here
router.post("/", createWatchman);         // Create new Watchman
router.get("/", getWatchmans);            // Get all Watchmen
router.put("/:id", updateWatchman);       // Update Watchman
router.delete("/:id", deleteWatchman);    // Delete Watchman

export default router;