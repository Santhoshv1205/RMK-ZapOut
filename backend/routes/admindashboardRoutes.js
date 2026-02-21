// routes/admindashboardroutes.js
import express from "express";
import {
  getAdminDashboardStats,

  getDepartmentsWithReports,
 
} from "../controllers/admindashboardController.js";

const router = express.Router();

// /api/admin/dashboard/...
router.get("/stats", getAdminDashboardStats);
router.get("/departments-reports", getDepartmentsWithReports);
export default router;