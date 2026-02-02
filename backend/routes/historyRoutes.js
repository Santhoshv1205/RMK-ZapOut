import express from "express";
import { getStaffHistory, getStudentHistory } from "../controllers/historyController.js";

const router = express.Router();

// GET /api/history/:userId
router.get("/:userId", getStudentHistory);

router.get("/staff/:userId", getStaffHistory);

export default router;
