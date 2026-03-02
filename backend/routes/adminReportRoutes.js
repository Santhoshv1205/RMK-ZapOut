import express from "express";
import { getAdminReport } from "../controllers/adminReportController.js";

const router = express.Router();

// FINAL endpoint → /api/admin/reports
router.get("/data", getAdminReport);

export default router;