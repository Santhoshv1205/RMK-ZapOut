import express from "express";
import parser from "../middlewares/cloudinaryUpload.js";
import {
  applyOnDuty,
  getStudentProfile,
} from "../controllers/onDutycontroller.js";

const router = express.Router();

// Apply On-Duty (file uploaded directly to Cloudinary)
router.post("/apply", parser.single("proofFile"), applyOnDuty);

// Get student profile
router.get("/profile/:userId", getStudentProfile);

export default router;