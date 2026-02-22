import { Users, User, Home, School } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchStaffDashboardStats } from "../../services/staffDashboardService";
import { fetchStaffProfile } from "../../services/staffProfileService";

const GREEN = "text-[#53cf57]";

const StatCard = ({ title, value, icon, color }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center justify-between hover:bg-white/15 transition">
    <div>
      <p className={`text-sm ${GREEN}`}>{title}</p>
      <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
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

  // clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const user = JSON.parse(stored);

    const load = async () => {
      try {
        setLoading(true);

        const profile = await fetchStaffProfile(user.id);
        setStaff(profile.data.profile);

        const stats = await fetchStaffDashboardStats(user.id, user.role);

        // ✅ show only assigned years
        const assignedYears = (stats.stats || []).filter(
          y =>
            y.counselling > 0 ||
            y.counselling_hostellers > 0 ||
            y.counselling_dayscholars > 0
        );

        setDashboardStats(assignedYears);
        setAcademicCalendars(stats.academicCalendar || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] min-h-screen text-white p-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold">
        Welcome to <span className="text-[#53cf57]">{staff?.role}</span> Dashboard
      </h1>

      <div className="flex justify-between mt-6">
        <div>
          <p className={`text-lg font-semibold ${GREEN}`}>
            Hello, {staff?.username}
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

      {/* STATS */}
      {!loading && dashboardStats.map(year => (
        <div key={year.year} className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${GREEN}`}>
            {year.year}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={year.total}
              icon={<Users />}
              color="bg-cyan-600/40"
            />
            <StatCard
              title="Your Counselling Students"
              value={year.counselling}
              icon={<User />}
              color="bg-green-600/40"
            />
            <StatCard
              title="Your Counselling Hostellers"
              value={year.counselling_hostellers}
              icon={<Home />}
              color="bg-yellow-600/40"
            />
            <StatCard
              title="Your Counselling Day Scholars"
              value={year.counselling_dayscholars}
              icon={<School />}
              color="bg-purple-600/40"
            />
          </div>
        </div>
      ))}

      {/* CALENDAR */}
      {!loading && academicCalendars.length > 0 && (
        <div className="mt-10">
          <h2 className={GREEN}>Academic Calendars</h2>
          <ul className="space-y-2 mt-3">
            {academicCalendars.map(file => (
              <li key={file.id}>
                <a href={file.cloud_url} target="_blank"
                   className="underline text-white/80">
                  {file.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default StaffDashboard;