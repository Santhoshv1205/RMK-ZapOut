import express from "express";
import parser from "../middlewares/cloudinaryUpload.js";
import {
  getAllStudentRequests,
  cancelRequest,
  updateRequest,
  getStaffRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";

const router = express.Router();

/* ---------------- STUDENT ROUTES ---------------- */

// Get all student requests
router.get("/student/:userId", getAllStudentRequests);

// Cancel request
router.delete("/:requestId", cancelRequest);

// Update request (optional new proof file → Cloudinary)
router.put("/:requestId", parser.single("proofFile"), updateRequest);

/* ---------------- STAFF ROUTES ---------------- */

// Get staff requests
router.get("/staff/:staffId/:role", getStaffRequests);

// Approve / Reject
router.put("/staff/request/:requestId/status", updateRequestStatus);

export default router;