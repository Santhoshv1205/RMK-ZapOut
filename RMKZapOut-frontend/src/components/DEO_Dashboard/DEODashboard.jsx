// src/pages/deo/DEODashboard.jsx
import { useEffect, useState, useRef } from "react";
import { FileText, Clock, CheckCircle, Users, X, User, School } from "lucide-react";
import { getDeoDashboardStats } from "../../services/deoService.jsx";
import { fetchStaffProfile } from "../../services/staffProfileService";

import * as XLSX from "xlsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const GREEN = "text-[#53cf57]";

/* ================= STAT CARD (UNCHANGED) ================= */
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
    <div className="p-3 rounded-lg bg-[#53cf57]/20 text-[#53cf57]">{icon}</div>
    <div>
      <p className="text-sm text-white/60">{label}</p>
      <h3 className="text-2xl font-semibold text-white">{value}</h3>
    </div>
  </div>
);

/* ================= PROFILE CARD ================= */
const ProfileCard = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-semibold break-words">{value || "-"}</p>
  </div>
);

/* ================= STUDENT MODAL ================= */
const StudentDetailsModal = ({ student, onClose, onVerify }) => {
  if (!student) return null;

  const isHosteller = student.student_type === "HOSTELLER";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#020617] border border-white/10 rounded-xl w-[600px] p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          Student Request Details
        </h2>

        <h3 className="text-white font-semibold mb-3">Student Details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ProfileCard label="Name" value={student.student_name} />
          <ProfileCard label="Student Type" value={student.student_type} />
          <ProfileCard label="Register Number" value={student.register_number} />
          <ProfileCard label="Email" value={student.student_email} />
          <ProfileCard label="Department" value={student.department} />
          <ProfileCard label="Year" value={student.year_of_study} />

          {isHosteller && (
            <>
              <ProfileCard label="Phone" value={student.phone} />
              <ProfileCard label="Father Name" value={student.father_name} />
              <ProfileCard label="Father Mobile" value={student.father_mobile} />
              <ProfileCard label="Mother Name" value={student.mother_name} />
              <ProfileCard label="Mother Mobile" value={student.mother_mobile} />
            </>
          )}
        </div>

        {student.status === "Pending" && (
          <button
            onClick={() => onVerify(student.id)}
            className="mt-4 w-full bg-[#53cf57] text-black py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
};

/* ================= MAIN ================= */
export default function DEODashboard() {
  const [now, setNow] = useState(new Date());
  const [staff, setStaff] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    odPending: 0,
    odApproved: 0,
    gatepassPending: 0,
    gatepassApproved: 0,
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicCalendar, setAcademicCalendar] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1");

  const calendarTableRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const profileRes = await fetchStaffProfile(user.id);
        setStaff(profileRes.data.profile);

        const data = await getDeoDashboardStats(user.id);

        /* ✅ CHANGE 1 — Applied Students from summary / total incoming requests */
        setStats({
          total: data.totalStudents,
          applied: data?.summary?.totalIncomingRequests || data.appliedStudents || 0,
          odPending: data.odPending,
          odApproved: data.odApproved,
          gatepassPending: data.gatepassPending,
          gatepassApproved: data.gatepassApproved,
        });

        setAcademicCalendar(data.academicCalendar || []);
      } catch (err) {
        setError("Failed to load dashboard",err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    setCalendarEvents(allEvents.filter((e) => e.year === selectedYear));
  }, [selectedYear, allEvents]);

  useEffect(() => {
    if (academicCalendar.length > 0) {
      loadCalendarEvents(academicCalendar[0].cloud_url);
    }
  }, [academicCalendar]);

  const scrollToCalendar = () => {
    calendarTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const downloadCalendar = async (fileUrl, filename) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "academic-calendar.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const loadCalendarEvents = async (fileUrl) => {
    try {
      const res = await fetch(fileUrl);
      const buffer = await res.arrayBuffer();

      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const events = [];
      let currentMonth = null;
      let currentYear = new Date().getFullYear();

      const monthMap = {
        january: "01",
        february: "02",
        march: "03",
        april: "04",
        may: "05",
        june: "06",
        july: "07",
        august: "08",
        september: "09",
        october: "10",
        november: "11",
        december: "12",
      };

      let yearColumns = { "1": null, "2": null, "3": null, "4": null };

      rows.forEach((row) => {
        if (!row) return;

        row.forEach((cell, index) => {
          if (!cell) return;
          const text = String(cell).toLowerCase();

          if (text.includes("i year")) yearColumns["1"] = index;
          if (text.includes("ii") && text.includes("year"))
            yearColumns["2"] = index;
          if (text.includes("iii") && text.includes("year"))
            yearColumns["3"] = index;
          if (text.includes("iv") && text.includes("year"))
            yearColumns["4"] = index;
        });
      });

      rows.forEach((row) => {
        if (!row) return;

        const firstCell = String(row[0] || "").toLowerCase();

        Object.keys(monthMap).forEach((m) => {
          if (firstCell.includes(m)) {
            currentMonth = monthMap[m];
            const yearMatch = firstCell.match(/\d{4}/);
            if (yearMatch) currentYear = yearMatch[0];
          }
        });

        if (!currentMonth) return;

        const dateIndex = row.findIndex(
          (cell) => typeof cell === "number" && cell >= 1 && cell <= 31
        );

        if (dateIndex === -1) return;

        const createEvent = (yearKey, colIndex) => {
          if (colIndex === null || colIndex === undefined) return;

          const textCell = row[colIndex];
          const dateCell = row[dateIndex];
          if (!textCell) return;

          const formattedDate =
            `${currentYear}-${currentMonth}-${String(dateCell).padStart(2, "0")}`;

          const text = String(textCell).toLowerCase();
          let color = "#22c55e";

          if (text.includes("holiday")) color = "#ef4444";
          else if (
            text.includes("exam") ||
            text.includes("assessment") ||
            text.includes("review") ||
            text.includes("project")
          ) {
            color = "#3b82f6";
          }

          events.push({
            title: textCell,
            date: formattedDate,
            backgroundColor: color,
            borderColor: color,
            display: "background",
            year: yearKey,
          });
        };

        createEvent("1", yearColumns["1"]);
        createEvent("2", yearColumns["2"]);
        createEvent("3", yearColumns["3"]);
        createEvent("4", yearColumns["4"]);
      });

      setAllEvents(events);
    } catch (err) {
      console.error("Calendar parse error:", err);
    }
  };

  return (
    <>
      {/* ✅ CHANGE 2 — remove white calendar header color */}
      <style>
        {`
          .fc .fc-col-header-cell,
          .fc-theme-standard th {
            background: transparent !important;
            border-color: rgba(255,255,255,0.15) !important;
          }
        `}
      </style>

      <div className="min-h-screen text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">
        <main className="px-8 py-6">

          <div className="mb-8">
            <h1 className="text-3xl font-semibold">
              Welcome to{" "}
              <span className="text-[#53cf57]">
                {staff?.role || "DEO"} Dashboard
              </span>
            </h1>

            <p className="text-gray-300 mt-2 max-w-3xl">
              Manage student counselling, monitor academic activities, track
              student engagement, and stay updated with institutional schedules.
            </p>
          </div>

          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#53cf57]/20 flex items-center justify-center">
                <User className="text-[#53cf57]" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Hello, <span className="text-[#53cf57]">{staff?.username}</span>
                </h2>

                <p className="text-sm text-gray-300 mt-1">
                  {staff?.role} | {staff?.department}
                </p>
              </div>
            </div>

            <div className="text-right text-sm text-gray-300">
              <p>{now.toDateString()}</p>
              <p className="text-[#53cf57] font-semibold">
                {now.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {loading && <p>Loading dashboard...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<FileText size={20} />} label="Total Students" value={stats.total} />
            <StatCard icon={<Clock size={20} />} label="OD Pending" value={stats.odPending} />
            <StatCard icon={<CheckCircle size={20} />} label="OD Approved" value={stats.odApproved} />
            <StatCard icon={<Users size={20} />} label="Applied Students" value={stats.applied} />
            <StatCard icon={<Clock size={20} />} label="Gatepass Pending" value={stats.gatepassPending} />
            <StatCard icon={<Users size={20} />} label="Gatepass Approved" value={stats.gatepassApproved} />
          </div>

          {academicCalendar.length > 0 && (
            <div
              ref={calendarTableRef}
              className="bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl p-6 mt-30 mb-5"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-[#53cf57]">
                  <School size={20} />
                  Academic Calendar
                </h2>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      downloadCalendar(
                        academicCalendar[0].cloud_url,
                        academicCalendar[0].filename
                      )
                    }
                    className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold shadow-lg shadow-green-500/40 transition"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => {
                      loadCalendarEvents(academicCalendar[0].cloud_url);
                      setTimeout(scrollToCalendar, 400);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold shadow-lg shadow-green-500/40 transition"
                  >
                    View
                  </button>
                </div>
              </div>

              {allEvents.length > 0 && (
                <>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>

                  <div className="mt-6">
                    <FullCalendar
                      plugins={[dayGridPlugin]}
                      initialView="dayGridMonth"
                      height="auto"
                      events={calendarEvents}
                      buttonText={{ today: now.toDateString() }}
                      eventDidMount={(info) => {
                        if (info.event.display === "background") {
                          info.el.style.opacity = "0.95";
                        }
                      }}
                      eventContent={(arg) => (
                        <div
                          style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "white",
                            padding: "6px",
                          }}
                        >
                          {arg.event.title}
                        </div>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <StudentDetailsModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        </main>
      </div>
    </>
  );
}