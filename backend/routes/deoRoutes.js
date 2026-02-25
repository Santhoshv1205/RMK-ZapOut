// routes/deoRoutes.js

import express from "express";
import { getDeoProfile, getDeoRequests, updateDeoProfile } from "../controllers/deoController.js";

const router = express.Router();

// GET DEO PROFILE
router.get("/profile/:userId", getDeoProfile);
router.put("/profile/:userId", updateDeoProfile);
router.get("/requests/:userId", getDeoRequests);

export default router;