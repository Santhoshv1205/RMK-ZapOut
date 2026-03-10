import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import qrcode from "qrcode";

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
import watchmanRoutes from "./routes/watchmanRoutes.js";
import adminWatchmanRoutes from "./routes/adminwatchmanRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";

// Import WhatsApp client + shared QR state
import client from "./services/whatsapp/whatsappClient.js";
import { getLatestQR, getIsReady } from "./services/whatsapp/whatsappClient.js";

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
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/staff", staffStudentRoutes);
app.use("/api/onduty", onDutyRoutes);
app.use("/api/gatepass", gatepassRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/staff/profile", staffProfileRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/history", historyRoutes);

// Dashboard routes
app.use("/api/admin/dashboard", admindashboardRoutes);
app.use("/api/staff/dashboard", staffDashboardRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);

// DEO & Watchman routes
app.use("/api/deo", deoRoutes);
app.use("/api/watchman", watchmanRoutes);
app.use("/api/admin/watchmans", adminWatchmanRoutes);

// --- WhatsApp QR Route ---
app.get("/qr", async (req, res) => {
  const isReady = getIsReady();
  const latestQR = getLatestQR();

  if (isReady) {
    return res.send(`
      <!DOCTYPE html><html><head><title>WhatsApp - Connected</title>
      <meta charset="UTF-8"/>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0f0a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Courier New',monospace}
        .card{background:#111811;border:1px solid #25d36633;border-radius:16px;padding:48px;text-align:center;box-shadow:0 0 60px #25d36622}
        .icon{font-size:64px;margin-bottom:16px}
        h1{color:#25d366;font-size:24px;margin-bottom:8px}
        p{color:#666;font-size:14px}
      </style></head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>WhatsApp Connected!</h1>
          <p>Your client is ready and online.</p>
        </div>
      </body></html>
    `);
  }

  if (!latestQR) {
    return res.send(`
      <!DOCTYPE html><html><head><title>WhatsApp QR</title>
      <meta charset="UTF-8"/>
      <meta http-equiv="refresh" content="3"/>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0f0a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Courier New',monospace}
        .card{background:#111811;border:1px solid #25d36633;border-radius:16px;padding:48px;text-align:center}
        .spinner{width:48px;height:48px;border:3px solid #25d36633;border-top-color:#25d366;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 20px}
        @keyframes spin{to{transform:rotate(360deg)}}
        h1{color:#25d366;font-size:20px;margin-bottom:8px}
        p{color:#555;font-size:13px}
      </style></head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h1>Initializing WhatsApp...</h1>
          <p>QR code is being generated. Page will refresh automatically.</p>
        </div>
      </body></html>
    `);
  }

  try {
    const qrDataURL = await qrcode.toDataURL(latestQR, {
      width: 400,
      margin: 3,
      color: { dark: "#000000", light: "#ffffff" }
    });

    res.send(`
      <!DOCTYPE html><html><head><title>WhatsApp QR Code</title>
      <meta charset="UTF-8"/>
      <meta http-equiv="refresh" content="30"/>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0f0a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Courier New',monospace}
        .card{background:#111811;border:1px solid #25d36644;border-radius:20px;padding:48px 40px;text-align:center;box-shadow:0 0 80px #25d36622,0 0 30px #25d36611;max-width:480px;width:100%}
        .logo{font-size:36px;margin-bottom:8px}
        h1{color:#25d366;font-size:22px;font-weight:700;letter-spacing:1px;margin-bottom:6px}
        .subtitle{color:#555;font-size:13px;margin-bottom:28px}
        .qr-wrapper{background:#fff;border-radius:12px;padding:16px;display:inline-block;box-shadow:0 0 40px #25d36633}
        img{display:block;border-radius:4px}
        .dot{display:inline-block;width:8px;height:8px;background:#25d366;border-radius:50%;margin-right:6px;animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .status{display:flex;align-items:center;justify-content:center;color:#25d366;font-size:13px;margin-top:18px}
        .note{margin-top:12px;color:#444;font-size:12px}
      </style></head>
      <body>
        <div class="card">
          <div class="logo">📱</div>
          <h1>WHATSAPP LOGIN</h1>
          <p class="subtitle">Open WhatsApp → Linked Devices → Link a Device</p>
          <div class="qr-wrapper">
            <img src="${qrDataURL}" width="300" height="300" alt="QR Code"/>
          </div>
          <div class="status"><span class="dot"></span> Waiting for scan...</div>
          <p class="note">QR refreshes automatically every 30 seconds</p>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("Error generating QR: " + err.message);
  }
});

// --- HTTP + Socket.io Setup ---
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`✅ RMK ZapOut backend running on port ${PORT}`);
  console.log(`📱 WhatsApp QR available at: http://localhost:${PORT}/qr`);
});