// routes/deoRoutes.js

import express from "express";
import { getDeoDashboardStats, getDeoProfile, getDeoRequests, getDeoStudents, updateDeoProfile } from "../controllers/deoController.js";

const router = express.Router();

// GET DEO PROFILE
router.get("/profile/:userId", getDeoProfile);
router.put("/profile/:userId", updateDeoProfile);
router.get("/requests/:userId", getDeoRequests);
router.get("/dashboard/:userId", getDeoDashboardStats);
router.get("/students/:userId", getDeoStudents);

export default router;