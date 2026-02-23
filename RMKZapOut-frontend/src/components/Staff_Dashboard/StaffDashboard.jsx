import { Users, User, Home, School } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchStaffDashboardStats } from "../../services/staffDashboardService";
import { fetchStaffProfile } from "../../services/staffProfileService";

/* ✅ ADDED — same as admin calendar */
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

  /* ✅ ADDED — calendar states */
  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1");
  const calendarRef = useRef(null);

  /* ✅ Live Clock */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ✅ Load Dashboard Data */
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

  /* ✅ Year filter */
  useEffect(() => {
    setCalendarEvents(allEvents.filter((e) => e.year === selectedYear));
  }, [selectedYear, allEvents]);

  /* ✅ AUTO LOAD FIRST CALENDAR ON PAGE LOAD */
  useEffect(() => {
    if (academicCalendars.length > 0) {
      loadCalendarEvents(academicCalendars[0].cloud_url);
    }
  }, [academicCalendars]);

  /* ==========================================================
     SAME EXCEL PARSER AS ADMIN (NO CHANGE)
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

  return (
    <div className="bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] min-h-screen text-white p-8">
      
      <h1 className="text-3xl font-bold">
        Welcome to{" "}
        <span className="text-[#53cf57]">
          {staff?.role || "Staff"}
        </span>{" "}
        Dashboard
      </h1>

      <div className="flex justify-between mt-6">
        <div>
          <p className={`text-lg font-semibold ${GREEN}`}>
            Hello, {staff?.username || "User"}
          </p>
          <p className="text-white/60 text-sm">
            {staff?.role} | {staff?.department}
          </p>
        </div>

        <div className="text-right">
          <p className="text-white/60">{now.toDateString()}</p>
          <p className={GREEN}>{now.toLocaleTimeString()}</p>
        </div>
      </div>

      {loading && <p className="mt-8">Loading dashboard...</p>}
      {error && <p className="text-red-500 mt-8">{error}</p>}

      {!loading && dashboardStats.length === 0 && (
        <div className="mt-10 text-white/70">No data available.</div>
      )}

      {!loading && staff?.role === "HOD" &&
        dashboardStats.map((year) => (
          <div key={year.year} className="mt-10">
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

      {!loading && staff?.role !== "HOD" &&
        dashboardStats
          .filter(
            (year) =>
              year.counselling > 0 ||
              year.counselling_hostellers > 0 ||
              year.counselling_dayscholars > 0
          )
          .map((year) => (
            <div key={year.year} className="mt-10">
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

      {!loading && academicCalendars.length > 0 && (
        <div className="mt-14">
          <h2 className={`text-xl font-semibold ${GREEN}`}>
            Academic Calendar
          </h2>

          <div className="space-y-3 mt-4">
            {academicCalendars.map((file) => (
              <div key={file.id}>
                <button
                  onClick={() => loadCalendarEvents(file.cloud_url)}
                  className="underline text-white/80 hover:text-white"
                >
                  {file.filename}
                </button>
              </div>
            ))}
          </div>

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
  <div className="mt-6">

              <FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  height="650px"

  headerToolbar={{
    left: "",
    center: "title",
    right: "currentDate prev,next"
  }}

  customButtons={{
  currentDate: {
    text: now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    click: () => {}
  }
}}

  events={calendarEvents}
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
                      color: "black",
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
    </div>
  );
};

export default StaffDashboard;