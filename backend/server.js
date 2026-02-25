import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import onDutyRoutes from "./routes/onDutyRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import gatepassRoutes from "./routes/gatepassRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import staffProfileRoutes from "./routes/staffProfileRoutes.js";
import adminStaffRoutes from "./routes/adminRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import staffStudentRoutes from "./routes/staffstudentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import { initSocket } from "./config/socket.js";
import admindashboardRoutes from "./routes/admindashboardRoutes.js";
import staffDashboardRoutes from "./routes/staffDashboardRoutes.js";
import studentDashboardRoutes from "./routes/studentDashboardRoutes.js";
import deoRoutes from "./routes/deoRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", adminStaffRoutes);
app.use("/api/admin", adminStudentRoutes);
app.use("/api/staff", staffStudentRoutes);
app.use("/api/onduty", onDutyRoutes);
app.use("/api/gatepass", gatepassRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/staff/profile", staffProfileRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/history", historyRoutes);
//dashboard routes
app.use("/api/admin/dashboard", admindashboardRoutes);
app.use("/api/staff/dashboard", staffDashboardRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);

//deo routes
app.use("/api/deo", deoRoutes);

// --- HTTP + Socket.io Setup ---
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// initialize socket
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`RMK ZapOut backend running on port ${PORT}`);
});


// import { sendWhatsAppMessage } from "./services/whatsapp/whatsappService.js";

// setTimeout(() => {
//     sendWhatsAppMessage("919361321901", `
// 🎓 RMK ZapOut - Gatepass Approved

// Hello Parent,

// Your Gatepass request has been APPROVED ✅

// 📅 From: 24-02-2026
// 📅 To: 28-02-2026
// 📍 Reason: sick leave

// 🧾 Please show the QR code at the college gate for verification.

// Thank you.
// RMK Engineering College
// `);
// }, 15000);