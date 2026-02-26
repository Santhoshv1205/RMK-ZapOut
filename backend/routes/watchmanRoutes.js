import express from "express";
import { getStudentByRegisterNumber,  } from "../controllers/watchmanDashboardController.js";

const router = express.Router();

// Get student info by scanned register number
router.get("/:register_number", getStudentByRegisterNumber);


export default router;