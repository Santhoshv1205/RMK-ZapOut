import { Users, User, Home, School } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchStaffDashboardStats } from "../../services/staffDashboardService";
import { fetchStaffProfile } from "../../services/staffProfileService";

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

  // ✅ Live Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Load Dashboard Data
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

        // Fetch Profile
        const profileRes = await fetchStaffProfile(user.id);
        setStaff(profileRes.data.profile);

        // Fetch Stats
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

  return (
    <div className="bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] min-h-screen text-white p-8">
      
      {/* HEADER */}
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

      {/* LOADING */}
      {loading && <p className="mt-8">Loading dashboard...</p>}

      {/* ERROR */}
      {error && <p className="text-red-500 mt-8">{error}</p>}

      {/* EMPTY STATE */}
      {!loading && dashboardStats.length === 0 && (
        <div className="mt-10 text-white/70">
          No data available.
        </div>
      )}

      {/* ============================= */}
      {/* HOD YEAR-WISE SUMMARY */}
      {/* ============================= */}
      {!loading && staff?.role === "HOD" &&
        dashboardStats.map((year) => (
          <div key={year.year} className="mt-10">
            <h2 className={`text-xl font-semibold mb-6 ${GREEN}`}>
              {year.year}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <StatCard
                title="Total Staff"
                value={year.total_staff}
                icon={<User size={28} />}
                color="bg-green-600/40"
              />

              <StatCard
                title="Total Students"
                value={year.total}
                icon={<Users size={28} />}
                color="bg-cyan-600/40"
              />

              <StatCard
                title="Total Hostellers"
                value={year.counselling_hostellers}
                icon={<Home size={28} />}
                color="bg-yellow-600/40"
              />

              <StatCard
                title="Total Day Scholars"
                value={year.counselling_dayscholars}
                icon={<School size={28} />}
                color="bg-purple-600/40"
              />
            </div>
          </div>
        ))}

      {/* ========================================= */}
      {/* COUNSELLOR / COORDINATOR YEAR-WISE */}
    
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

              <StatCard
                title="Total Students"
                value={year.total}
                icon={<Users size={28} />}
                color="bg-cyan-600/40"
              />

              <StatCard
                title="Your Counselling Students"
                value={year.counselling}
                icon={<User size={28} />}
                color="bg-green-600/40"
              />

              <StatCard
                title="Your Counselling Hostellers"
                value={year.counselling_hostellers}
                icon={<Home size={28} />}
                color="bg-yellow-600/40"
              />

              <StatCard
                title="Your Counselling Day Scholars"
                value={year.counselling_dayscholars}
                icon={<School size={28} />}
                color="bg-purple-600/40"
              />

            </div>
          </div>
        ))}

      {/* ============================= */}
      {/* ACADEMIC CALENDAR */}
      {/* ============================= */}
      {!loading && academicCalendars.length > 0 && (
        <div className="mt-14">
          <h2 className={`text-xl font-semibold ${GREEN}`}>
            Academic Calendar
          </h2>

          <ul className="space-y-3 mt-4">
            {academicCalendars.map((file) => (
              <li key={file.id}>
                <a
                  href={file.cloud_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-white/80 hover:text-white"
                >
                  {file.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;