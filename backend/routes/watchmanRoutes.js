import express from "express";
import { 
  scanAndMarkExit,
  scanAndMarkEntry,
  getWatchmanLogs,
  getWatchmanProfile,
  updateWatchmanProfile
} from "../controllers/watchmanDashboardController.js";

const router = express.Router();

// 🔴 Scan & Mark Exit
router.post("/exit/:register_number", scanAndMarkExit);

// 🟢 Scan & Mark Entry
router.post("/entry/:register_number", scanAndMarkEntry);
// Gatepass logs
router.get("/logs", getWatchmanLogs);

/* PROFILE */
router.get("/profile/:id", getWatchmanProfile);
router.put("/profile/:id", updateWatchmanProfile);

export default router;