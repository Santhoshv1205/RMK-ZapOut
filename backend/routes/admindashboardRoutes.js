// routes/admindashboardroutes.js
import express from "express";
import {
  
  deleteAcademicCalendar,
  getAcademicCalendars,
  getAdminDashboardStats,

  getDepartmentsWithReports,
  uploadAcademicCalendar,

 
} from "../controllers/admindashboardController.js";
import parser from "../middlewares/cloudinaryUpload.js";
const router = express.Router();

// /api/admin/dashboard/...
router.get("/stats", getAdminDashboardStats);
router.get("/departments-reports", getDepartmentsWithReports);

router.post("/academic-calendar", parser.single("file"), uploadAcademicCalendar);

// Get uploaded calendars
router.get("/academic-calendar", getAcademicCalendars);
// Delete an academic calendar
router.delete("/academic-calendar/:id", deleteAcademicCalendar);

export default router;