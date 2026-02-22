import { useEffect, useState } from "react";
import { Users, UserCheck, GraduationCap, Shield, X } from "lucide-react";
import * as XLSX from "xlsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import {
  fetchDashboardStats,
  fetchDepartments,
  fetchCalendars,
  uploadCalendar,
  deleteCalendar,
} from "../../services/admindashboardService";

/* ---------- UI ---------- */

const StatCard = ({ icon, title, value, color }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-red-500">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value ?? "—"}</h3>
    </div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-red-500 mb-4">{title}</h3>
    {children}
  </div>
);

/* ---------- MAIN ---------- */

const AdminDashboard = () => {
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [calendars, setCalendars] = useState([]);

  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1");

  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ---------- CLOCK ---------- */

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setCalendarEvents(allEvents.filter((e) => e.year === selectedYear));
  }, [selectedYear, allEvents]);

  /* ---------- LOAD DASHBOARD ---------- */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [statsRes, deptRes, calRes] = await Promise.all([
        fetchDashboardStats(),
        fetchDepartments(),
        fetchCalendars(),
      ]);

      setStats(statsRes.data.stats);
      setDepartments(deptRes.data.data || []);

      const uploadedCalendars = calRes.data.data || [];
      setCalendars(uploadedCalendars);

      if (uploadedCalendars.length > 0) {
        loadCalendarEvents(uploadedCalendars[0].cloud_url);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     AUTO EXCEL LAYOUT DETECTION (ONLY CHANGE MADE)
     ========================================================== */

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

      /* ---------- detect year column positions ---------- */

      let yearColumns = {
        "1": null,
        "2": null,
        "3": null,
        "4": null,
      };

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

      /* ---------- parse rows ---------- */

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
          ) color = "#3b82f6";
          else if (text.includes("working") || text.includes("order"))
            color = "#22c55e";

          events.push({
  title: textCell,
  date: formattedDate,
  backgroundColor: color,
  borderColor: color,

  display: "background", // ⭐ THIS COLORS FULL CELL
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

  /* ---------- ACTIONS ---------- */

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    setUploading(true);
    try {
      await uploadCalendar(file);
      setFile(null);
      await loadDashboard();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this calendar?")) return;
    await deleteCalendar(id);
    await loadDashboard();
  };

  if (loading)
    return <div className="p-10 text-white">Loading Dashboard...</div>;

  /* ---------- UI ---------- */

return (
  <div className="p-8 space-y-8">

    {/* HEADER */}
    <div className="flex justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="text-white">Welcome to </span>
          <span className="text-red-500">Admin Dashboard</span>
        </h1>
      </div>
      <div className="text-white">
        <p>{now.toDateString()}</p>
        <p className="text-red-500">{now.toLocaleTimeString()}</p>
      </div>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="text-white"/>} color="bg-cyan-500/80"/>
      <StatCard title="Students" value={stats?.totalStudents} icon={<GraduationCap className="text-white"/>} color="bg-blue-500/80"/>
      <StatCard title="Staff" value={stats?.totalStaff} icon={<UserCheck className="text-white"/>} color="bg-emerald-500/80"/>
      <StatCard title="Roles" value={stats?.totalRoles} icon={<Shield className="text-white"/>} color="bg-purple-500/80"/>
    </div>

    {/* DEPARTMENTS */}
    <SectionCard title="Department-wise Reports">
      {departments.length === 0 ? (
        <p className="text-white/80">No departments found</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {departments.map((d) => (
            <li key={d.id} className="flex justify-between items-center p-3 border border-white/10 rounded-xl hover:bg-white/5">
              <span className="font-semibold text-white">{d.name}</span>
              <div className="flex gap-4 text-white/70 text-xs">
                <span>Students: {d.total_students}</span>
                <span>Staff: {d.total_staff}</span>
                <span className="text-blue-200">Gate Pass: {d.gate_pass_reports ?? 0}</span>
                <span className="text-green-200">On-Duty: {d.on_duty_reports ?? 0}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>

    {/* UPLOAD CALENDAR */}
    <SectionCard title="Upload Academic Calendar">
      <div className="flex gap-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
        <button onClick={handleUpload} className="bg-red-500 px-4 py-2 text-white rounded">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="mt-6">
        {calendars.map((c) => (
          <div key={c.id} className="flex justify-between text-white">
            <span
              onClick={() => loadCalendarEvents(c.cloud_url)}
              className="cursor-pointer underline text-blue-300"
            >
              {c.filename}
            </span>
            <button onClick={() => handleDelete(c.id)}>
              <X className="text-red-500"/>
            </button>
          </div>
        ))}
      </div>
    </SectionCard>

    {/* CALENDAR */}
    <SectionCard title="Academic Calendar View">

      {/* YEAR FILTER */}
      <div className="mb-4">
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

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="650px"
        events={calendarEvents}

        /* FULL CELL COLOR */
        eventDidMount={(info) => {
          if (info.event.display === "background") {
            info.el.style.opacity = "0.95";
          }
        }}

        /* TEXT VISIBILITY */
        eventContent={(arg) => (
  <div
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",      // vertical center
      justifyContent: "center",  // horizontal center
      textAlign: "center",
      whiteSpace: "normal",
      wordBreak: "break-word",
      fontSize: "12px",
      fontWeight: "700",
      color: "black",
      padding: "6px",
      lineHeight: "1.3"
    }}
  >
    {arg.event.title}
  </div>
)}
      />
    </SectionCard>

  </div>
);
};

export default AdminDashboard;