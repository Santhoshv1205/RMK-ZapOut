// (YOUR IMPORTS — unchanged)
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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

import * as XLSX from "xlsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

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

  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1");

  const calendarTableRef = useRef(null);

  const glass =
    "bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl";

  /* ======================= LIVE CLOCK ======================== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ======================= LOAD PROFILE + STATS ======================== */
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

  /* AUTO LOAD FIRST CALENDAR */
  useEffect(() => {
    if (academicCalendar.length > 0) {
      loadCalendarEvents(academicCalendar[0].cloud_url);
    }
  }, [academicCalendar]);

  /* YEAR FILTER */
  useEffect(() => {
    setCalendarEvents(allEvents.filter((e) => e.year === selectedYear));
  }, [selectedYear, allEvents]);

  /* SCROLL TO CALENDAR */
  const scrollToCalendar = () => {
    calendarTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* DIRECT DOWNLOAD XLSX */
  const downloadCalendar = async (fileUrl, filename) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "academic-calendar.xlsx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  /* ================= EXCEL PARSER — UNCHANGED ================= */
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
          if (text.includes("ii") && text.includes("year")) yearColumns["2"] = index;
          if (text.includes("iii") && text.includes("year")) yearColumns["3"] = index;
          if (text.includes("iv") && text.includes("year")) yearColumns["4"] = index;
        });
      });

      if (yearColumns["2"] && !yearColumns["3"])
        yearColumns["3"] = yearColumns["2"];

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
          )
            color = "#3b82f6";

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
            Welcome to <span className="text-[#53eafd]">Student Dashboard</span>
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
                Hello, <span className="text-[#53eafd]">{student.username}</span>
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {student.role} | {student.register_number} |{" "}
                <span className="text-[#53eafd]">{student.student_type}</span>
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
          <SummaryCard title="Total Requests" value={stats.total} icon={<FileText />} iconClass="bg-cyan-400/20 text-cyan-300" />
          <SummaryCard title="Pending" value={stats.pending} icon={<Clock />} iconClass="bg-yellow-400/20 text-yellow-300" />
          <SummaryCard title="Approved" value={stats.approved} icon={<CheckCircle />} iconClass="bg-green-400/20 text-green-300" />
          <SummaryCard title="Rejected" value={stats.rejected} icon={<XCircle />} iconClass="bg-red-400/20 text-red-300" />
        </div>

        {/* APPLY BUTTONS */}
        <div className={`grid ${student.student_type?.toLowerCase() === "hosteller" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6 mb-12`}>
          {student.student_type?.toLowerCase() === "hosteller" && (
            <ApplyCard title="Apply Gate Pass" onClick={() => navigate("/student/apply-gatepass")} />
          )}
          <ApplyCard title="Apply On-Duty" onClick={() => navigate("/student/apply-od")} />
        </div>

        {/* ACADEMIC CALENDAR */}
        {academicCalendar.length > 0 && (
          <div className={`${glass} p-6`}>

            {/* HEADER WITH BUTTONS */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#53eafd]">
                <Calendar />
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
className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/40 transition"                >
                  Download
                </button>

                <button
                  onClick={() => {
                    loadCalendarEvents(academicCalendar[0].cloud_url);
                    setTimeout(scrollToCalendar, 400);
                  }}
className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/40 transition"                >
                  View
                </button>
              </div>
            </div>

            <ul className="space-y-4">
              {academicCalendar.map((file) => (
                <li key={file.id}>
                  <span
                    onClick={() => loadCalendarEvents(file.cloud_url)}
                    className="underline text-gray-300 hover:text-white cursor-pointer"
                  >
                    {file.filename}
                  </span>
                </li>
              ))}
            </ul>

            {allEvents.length > 0 && (
              <div className="mt-6">
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
              </div>
            )}

            {calendarEvents.length > 0 && (
              <div ref={calendarTableRef} className="mt-6">
                <FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  height="650px"
  events={calendarEvents}
  buttonText={{
    today: now.toDateString(),
  }}
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
            )}
          </div>
        )}

      </main>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, iconClass }) => (
  <div className="bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-[#53eafd] tracking-wide">{title}</p>
      <p className="text-4xl font-bold text-white mt-1">{value ?? 0}</p>
    </div>
    <div className={`p-4 rounded-xl ${iconClass}`}>{icon}</div>
  </div>
);

const ApplyCard = ({ title, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-gradient-to-r from-cyan-300 to-blue-400 text-black rounded-2xl p-6 shadow-2xl hover:scale-[1.03] transition"
  >
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm mt-1 opacity-80">Click to submit request</p>
  </div>
);

export default StudentDashboard;