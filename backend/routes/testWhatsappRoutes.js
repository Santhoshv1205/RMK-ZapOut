import express from "express";
import { sendTestMessage } from "../controllers/testWhatsappController.js";

const router = express.Router();

router.get("/test-whatsapp", sendTestMessage);

export default router;