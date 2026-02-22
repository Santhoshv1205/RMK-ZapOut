import express from "express";
import { getStaffDashboardStats } from "../controllers/staffDashboardController.js";

const router = express.Router();

// GET /api/staff/dashboard/stats/:staffId
router.get("/stats/:staffId", getStaffDashboardStats);

export default router;