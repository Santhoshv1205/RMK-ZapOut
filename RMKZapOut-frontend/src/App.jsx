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
import AdminWatchman from "./components/Admin_Dashboard/AdminWatchman.jsx";
import AdminSettings from "./components/Admin_Dashboard/AdminSettings.jsx";
import { NotificationProvider } from "./components/context/NotificationContext.jsx";
import { RequestBadgeProvider } from "./components/context/RequestBadgeContext.jsx";

/* ================= DEO ================= */
import DEOLayout from "./components/DEO_Dashboard/DEOLayout.jsx";
import DEODashboard from "./components/DEO_Dashboard/DEODashboard.jsx";

import PrintView from "./components/DEO_Dashboard/StudentsList.jsx";
import DEOProfile from "./components/DEO_Dashboard/DEOProfile.jsx";
import DEONeedHelp from "./components/DEO_Dashboard/DEONeedHelp.jsx";
import DEORequests from "./components/DEO_Dashboard/DEORequests.jsx";
import WatchmanLayout from "./components/Watchman_Dashboard/WatchmanLayout.jsx";

import WatchmanLogs from "./components/Watchman_Dashboard/WatchmanLogs.jsx";
import WatchmanProfile from "./components/Watchman_Dashboard/WatchmanProfile.jsx";
import ExitScan from "./components/Watchman_Dashboard/ExitScan.jsx";
import EntryScan from "./components/Watchman_Dashboard/EntryScan.jsx";



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
      <Route
        path="/staff"
        element={
          <NotificationProvider>
            <RequestBadgeProvider>
              <StaffLayout />
            </RequestBadgeProvider>
          </NotificationProvider>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="requests" element={<StaffRequests />} />
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
        <Route path="watchman" element={<AdminWatchman />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ================= DEO ================= */}
      <Route path="/deo" element={<DEOLayout />}>
        <Route path="dashboard" element={<DEODashboard />} />
<Route path="students" element={<DEORequests />} />
        <Route path="print" element={<PrintView />} />
        <Route path="profile" element={<DEOProfile />} />
<Route path="need-help" element={<DEONeedHelp />} />
      </Route>

      {/* ================= WATCHMAN ================= */}
      <Route path="/watchman" element={<WatchmanLayout />}>
        <Route path="exit-scan" element={<ExitScan />} />
        <Route path="entry-scan" element={<EntryScan />} />
        <Route path="logs" element={<WatchmanLogs />} />
        <Route path="profile" element ={<WatchmanProfile />} />
      </Route>




    </Routes>
  );
};

export default App;