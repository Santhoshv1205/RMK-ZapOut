import { Users, User, Home, School } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchStaffDashboardStats } from "../../services/staffDashboardService";
import { fetchStaffProfile } from "../../services/staffProfileService";

import * as XLSX from "xlsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const GREEN = "text-[#53cf57]";

const StatCard = ({ title, value, icon, color }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center justify-between hover:bg-white/15 transition">
    <div>
      <p className={`text-sm ${GREEN}`}>{title}</p>
      <h2 className="text-3xl font-bold text-white mt-1">{value ?? 0}</h2>
    </div>
    <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
  </div>
);

const StaffDashboard = () => {
  const [now, setNow] = useState(new Date());
  const [staff, setStaff] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [academicCalendars, setAcademicCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1");

  
  const calendarTableRef = useRef(null);

  /* LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* LOAD DASHBOARD */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(stored);

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const profileRes = await fetchStaffProfile(user.id);
        setStaff(profileRes.data.profile);

        const statsRes = await fetchStaffDashboardStats(
          user.id,
          user.role
        );

        setDashboardStats(statsRes.stats || []);
        setAcademicCalendars(statsRes.academicCalendar || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* YEAR FILTER */
  useEffect(() => {
    setCalendarEvents(allEvents.filter((e) => e.year === selectedYear));
  }, [selectedYear, allEvents]);

  /* AUTO LOAD FIRST CALENDAR */
  useEffect(() => {
    if (academicCalendars.length > 0) {
      loadCalendarEvents(academicCalendars[0].cloud_url);
    }
  }, [academicCalendars]);

  /* SCROLL */
  const scrollToCalendar = () => {
    calendarTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* DOWNLOAD */
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

  /* EXCEL PARSER — UNCHANGED */
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
          let color = "#22c55e"; // green (default events)

if (text.includes("holiday")) {
  color = "#ef4444"; // red
} else if (
  text.includes("exam") ||
  text.includes("assessment") ||
  text.includes("review") ||
  text.includes("project")
) {
  color = "#3b82f6"; // blue
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
    <div className="min-h-screen text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">
      <main className="px-8 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Welcome to{" "}
            <span className="text-[#53cf57]">
              {staff?.role || "Staff"} Dashboard
            </span>
          </h1>

          <p className="text-gray-300 mt-2 max-w-3xl">
            Manage student counselling, monitor academic activities, track
            student engagement, and stay updated with institutional schedules.
          </p>
        </div>

        {/* GREETING */}
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

        {loading && <p className="mt-8">Loading dashboard...</p>}
        {error && <p className="text-red-500 mt-8">{error}</p>}

        {!loading && dashboardStats.length === 0 && (
          <div className="mt-10 text-white/70">No data available.</div>
        )}

        {/* HOD STATS */}
        {!loading && staff?.role === "HOD" &&
          dashboardStats.map((year) => (
            <div key={year.year} className="mb-12">
              <h2 className={`text-xl font-semibold mb-6 ${GREEN}`}>
                {year.year}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Staff" value={year.total_staff} icon={<User size={28} />} color="bg-green-600/40" />
                <StatCard title="Total Students" value={year.total} icon={<Users size={28} />} color="bg-cyan-600/40" />
                <StatCard title="Total Hostellers" value={year.counselling_hostellers} icon={<Home size={28} />} color="bg-yellow-600/40" />
                <StatCard title="Total Day Scholars" value={year.counselling_dayscholars} icon={<School size={28} />} color="bg-purple-600/40" />
              </div>
            </div>
          ))}

        {/* NON HOD STATS */}
        {!loading && staff?.role !== "HOD" &&
          dashboardStats
            .filter(
              (year) =>
                year.counselling > 0 ||
                year.counselling_hostellers > 0 ||
                year.counselling_dayscholars > 0
            )
            .map((year) => (
              <div key={year.year} className="mb-12">
                <h2 className={`text-xl font-semibold mb-6 ${GREEN}`}>
                  {year.year}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Students" value={year.total} icon={<Users size={28} />} color="bg-cyan-600/40" />
                  <StatCard title="Your Counselling Students" value={year.counselling} icon={<User size={28} />} color="bg-green-600/40" />
                  <StatCard title="Your Counselling Hostellers" value={year.counselling_hostellers} icon={<Home size={28} />} color="bg-yellow-600/40" />
                  <StatCard title="Your Counselling Day Scholars" value={year.counselling_dayscholars} icon={<School size={28} />} color="bg-purple-600/40" />
                </div>
              </div>
            ))}

        {/* CALENDAR MODULE */}
        {!loading && academicCalendars.length > 0 && (
<div
  ref={calendarTableRef}
  className="bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-2xl p-6 mt-30 mb-12"
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
                      academicCalendars[0].cloud_url,
                      academicCalendars[0].filename
                    )
                  }
                  className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold shadow-lg shadow-green-500/40 transition"
                >
                  Download
                </button>

                <button
                  onClick={() => {
                    loadCalendarEvents(academicCalendars[0].cloud_url);
                    setTimeout(scrollToCalendar, 400);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold shadow-lg shadow-green-500/40 transition"
                >
                  View
                </button>
              </div>
            </div>

            <ul className="space-y-4">
              {academicCalendars.map((file) => (
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

export default StaffDashboard;