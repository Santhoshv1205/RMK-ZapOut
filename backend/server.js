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
import watchmanRoutes from "./routes/watchmanRoutes.js";
import adminWatchmanRoutes from "./routes/adminwatchmanRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
res.send("RMK ZapOut Backend Running");
});

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

app.use("/api/admin/dashboard", admindashboardRoutes);
app.use("/api/staff/dashboard", staffDashboardRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);

app.use("/api/deo", deoRoutes);
app.use("/api/watchman", watchmanRoutes);
app.use("/api/admin/watchmans", adminWatchmanRoutes);

;

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
console.log(`RMK ZapOut backend running on port ${PORT}`);
});
