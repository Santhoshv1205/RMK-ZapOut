import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";

import { fetchStudentProfile } from "../../services/studentProfileService.jsx";
import { fetchStudentDashboardStats } from "../../services/StudentDashboardService.jsx";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [academicCalendar, setAcademicCalendar] = useState([]);

  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const glass =
    "bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl";

  /* =======================
     LIVE CLOCK
  ======================== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* =======================
     LOAD PROFILE + STATS
  ======================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);

    const loadDashboard = async () => {
      try {
        const profileRes = await fetchStudentProfile(user.id);
        setStudent(profileRes.data);

        const statsRes = await fetchStudentDashboardStats(user.id);

        setStats(statsRes.data.stats || {});
        setAcademicCalendar(statsRes.data.academicCalendar || []);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#020617]">
        Loading dashboard...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#020617]">
        Unable to load dashboard
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">
      <main className="px-8 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Welcome to{" "}
            <span className="text-[#53eafd]">Student Dashboard</span>
          </h1>
          <p className="text-gray-300 mt-2 max-w-3xl">
            Manage your gate pass and on-duty requests, track approval status,
            and stay informed about your campus activities.
          </p>
        </div>

        {/* GREETING */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#53eafd]/20 flex items-center justify-center">
              <User className="text-[#53eafd]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                Hello,{" "}
                <span className="text-[#53eafd]">{student.username}</span>
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {student.role} | {student.register_number} |{" "}
                <span className="text-[#53eafd]">
                  {student.student_type}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right text-sm text-gray-300">
            <p>{now.toDateString()}</p>
            <p className="text-[#53eafd] font-semibold">
              {now.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

          <SummaryCard
            title="Total Requests"
            value={stats.total}
            icon={<FileText />}
            iconClass="bg-cyan-400/20 text-cyan-300"
          />

          <SummaryCard
            title="Pending"
            value={stats.pending}
            icon={<Clock />}
            iconClass="bg-yellow-400/20 text-yellow-300"
          />

          <SummaryCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle />}
            iconClass="bg-green-400/20 text-green-300"
          />

          <SummaryCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle />}
            iconClass="bg-red-400/20 text-red-300"
          />

        </div>

        {/* APPLY BUTTONS */}
        <div
          className={`grid ${
            student.student_type?.toLowerCase() === "hosteller"
              ? "md:grid-cols-2"
              : "md:grid-cols-1"
          } gap-6 mb-12`}
        >
          {student.student_type?.toLowerCase() === "hosteller" && (
            <ApplyCard
              title="Apply Gate Pass"
              onClick={() => navigate("/student/apply-gatepass")}
            />
          )}

          <ApplyCard
            title="Apply On-Duty"
            onClick={() => navigate("/student/apply-od")}
          />
        </div>

        {/* ACADEMIC CALENDAR */}
        {academicCalendar.length > 0 && (
          <div className={`${glass} p-6`}>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[#53eafd] mb-6">
              <Calendar />
              Academic Calendar
            </h2>

            <ul className="space-y-3">
              {academicCalendar.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.cloud_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-gray-300 hover:text-white"
                  >
                    {file.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </main>
    </div>
  );
};

/* ======================
   COMPONENTS
====================== */

const SummaryCard = ({ title, value, icon, iconClass }) => (
  <div className="bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-[#53eafd] tracking-wide">{title}</p>
      <p className="text-4xl font-bold text-white mt-1">
        {value ?? 0}
      </p>
    </div>
    <div className={`p-4 rounded-xl ${iconClass}`}>
      {icon}
    </div>
  </div>
);

const ApplyCard = ({ title, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-gradient-to-r from-cyan-300 to-blue-400 text-black rounded-2xl p-6 shadow-2xl hover:scale-[1.03] transition"
  >
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm mt-1 opacity-80">
      Click to submit request
    </p>
  </div>
);

export default StudentDashboard;