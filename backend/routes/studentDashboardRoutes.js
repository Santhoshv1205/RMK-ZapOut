// routes/studentDashboardRoutes.js

import express from "express";
import { getStudentDashboardStats } from "../controllers/studentDashboardController.js";

const router = express.Router();

router.get("/stats/:studentId", getStudentDashboardStats);

export default router;