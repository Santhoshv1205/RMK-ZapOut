import express from "express";
import { 
  scanAndMarkExit,
  scanAndMarkEntry,
  getWatchmanLogs
} from "../controllers/watchmanDashboardController.js";

const router = express.Router();

// 🔴 Scan & Mark Exit
router.post("/exit/:register_number", scanAndMarkExit);

// 🟢 Scan & Mark Entry
router.post("/entry/:register_number", scanAndMarkEntry);

router.get("/logs", getWatchmanLogs);



export default router;