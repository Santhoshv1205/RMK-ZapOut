import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);


fetchStaffProfile(user.id)
  .then((res) => {
    setStaff(res.data.profile); // <-- access the 'data' property
    setLoading(false);
  })
  .catch(() => setLoading(false));

  }, []);

  return (
    <div
      className="
        bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]
        flex-1 min-h-screen overflow-y-auto text-white p-8
      "
    >
      {/* ================= HEADER ================= */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Welcome to </span>
          <span className="text-[#53cf57]">
            {staff?.role || "Staff"}
            <span className="text-white"> Dashboard</span>
          </span>
        </h1>

        <p className="text-white/70 mt-1">
          Manage students, approvals, and live requests
        </p>

        <div className="flex items-center justify-between mt-6">
          {!loading && staff && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <User className={GREEN} />
              </div>

              <div>
                <p className={`text-lg font-semibold ${GREEN}`}>
                  Hello{staff?.username ? `, ${staff.username}` : ""}
                </p>
                <p className="text-xs text-white/60">
                  {staff.role} | {staff.department}
                </p>
              </div>
            </div>
          )}

          <div className="text-right">
            <p className="text-sm text-white/60">{now.toDateString()}</p>
            <p className={`font-semibold ${GREEN}`}>
              {now.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Students"
          value="320"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-cyan-600/40"
        />
        <StatCard
          title="Pending Requests"
          value="18"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-yellow-600/40"
        />
        <StatCard
          title="Approved"
          value="142"
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-green-600/40"
        />
        <StatCard
          title="Rejected"
          value="9"
          icon={<XCircle className="w-6 h-6 text-white" />}
          color="bg-red-600/40"
        />
      </div>

      {/* ================= LIVE REQUESTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${GREEN}`}>
            <FileText className={`w-5 h-5 ${GREEN}`} />
            Live Requests
          </h2>

          <div className="space-y-4">
            {[
              { name: "Arjun S", type: "Gate Pass", status: "Pending" },
              { name: "Kavya R", type: "On-Duty", status: "Pending" },
              { name: "Rahul M", type: "Gate Pass", status: "Pending" },
            ].map((req, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <div>
                  <p className="font-semibold text-white">{req.name}</p>
                  <p className={`text-sm ${GREEN}`}>{req.type}</p>
                </div>
                <span className="text-yellow-300 text-sm font-medium">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${GREEN}`}>
            <Bell className={`w-5 h-5 ${GREEN}`} />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 text-white">
              🔔 New Gate Pass request from <b>Arjun S</b>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-white">
              ✅ OD request approved for <b>Kavya R</b>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-white">
              ⏰ Return time nearing for <b>Rahul M</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
