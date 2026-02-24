import { Routes, Route } from "react-router-dom";
import "./App.css";

/* ================= AUTH ================= */
import Login from "./components/Login.jsx";

/* ================= STUDENT ================= */
import StudentLayout from "./components/Student_Dashboard/StudentLayout.jsx";
import StudentDashboard from "./components/Student_Dashboard/StudentDashboard.jsx";
import StudentRequests from "./components/Student_Dashboard/StudentRequests.jsx";
import StudentProfile from "./components/Student_Dashboard/StudentProfile.jsx";
import StudentHistory from "./components/Student_Dashboard/StudentHistory.jsx";
import StudentNotifications from "./components/Student_Dashboard/StudentNotifications.jsx";
import GatepassForm from "./components/Student_Dashboard/GatePassForm.jsx";
import OnDutyForm from "./components/Student_Dashboard/OnDutyForm.jsx";
import Staffs from "./components/Student_Dashboard/Staffs.jsx";
import NeedHelp from "./components/Student_Dashboard/NeedHelp.jsx";

/* ================= STAFF ================= */
import StaffLayout from "./components/Staff_Dashboard/StaffLayout.jsx";
import StaffDashboard from "./components/Staff_Dashboard/StaffDashboard.jsx";
import StaffRequests from "./components/Staff_Dashboard/StaffRequests.jsx";
import StaffHistory from "./components/Staff_Dashboard/StaffHistory.jsx";
import StaffNotifications from "./components/Staff_Dashboard/StaffNotifications.jsx";
import StaffNeedHelp from "./components/Staff_Dashboard/StaffNeedHelp.jsx";
import StaffProfile from "./components/Staff_Dashboard/StaffProfile.jsx";
import Students from "./components/Staff_Dashboard/Students.jsx";

/* ================= ADMIN ================= */
import AdminLayout from "./components/Admin_Dashboard/AdminLayout.jsx";
import AdminDashboard from "./components/Admin_Dashboard/AdminDashboard.jsx";
import AdminStudents from "./components/Admin_Dashboard/AdminStudents.jsx";
import AdminStaffs from "./components/Admin_Dashboard/AdminStaffs.jsx";
import Departments from "./components/Admin_Dashboard/Departments.jsx";
import AdminReports from "./components/Admin_Dashboard/AdminReports.jsx";
import AdminNotifications from "./components/Admin_Dashboard/AdminNotifications.jsx";
import AuditLogs from "./components/Admin_Dashboard/AuditLogs.jsx";
import AdminSettings from "./components/Admin_Dashboard/AdminSettings.jsx";
import { NotificationProvider } from "./components/context/NotificationContext.jsx";
import { RequestBadgeProvider } from "./components/context/RequestBadgeContext.jsx";
import DEODashboard from "./components/DEO_Dashboard/DEODashboard.jsx";
import DEOLayout from "./components/DEO_Dashboard/DEOLayout.jsx";

const App = () => {
  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      <Route path="/" element={<Login />} />

      {/* ================= STUDENT ================= */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="requests" element={<StudentRequests />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="staffs" element={<Staffs />} />
        <Route path="apply-gatepass" element={<GatepassForm />} />
        <Route path="apply-od" element={<OnDutyForm />} />
        <Route path="help" element={<NeedHelp />} />
      </Route>

      {/* ================= STAFF ================= */}
      <Route path="/staff" element={
        <NotificationProvider>
          <RequestBadgeProvider>
          <StaffLayout />
          </RequestBadgeProvider>
        </NotificationProvider>
        }>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="requests" element={
          <StaffRequests />

          } />
        <Route path="history" element={<StaffHistory />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="need-help" element={<StaffNeedHelp />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="staffs" element={<AdminStaffs />} />
        <Route path="departments" element={<Departments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ================= DEO ================= */}
      <Route path="/deo" element={<DEOLayout />}>

        <Route path="dashboard" element={<DEODashboard />} />
        
        

        </Route>
    </Routes>
  );
};

export default App;
