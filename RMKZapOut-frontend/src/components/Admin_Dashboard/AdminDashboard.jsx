// src/components/Admin_Dashboard/AdminDashboard.jsx
import {
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchDashboardStats,
  fetchDepartments,
} from "../../services/admindashboardService";

/* =========================
   SMALL UI CARDS
========================= */
const StatCard = ({ icon, title, value, color }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition">
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

/* =========================
   MAIN COMPONENT
========================= */
const AdminDashboard = () => {
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== LIVE CLOCK ===== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===== LOAD DASHBOARD ===== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [statsRes, deptRes] = await Promise.all([
          fetchDashboardStats(),
          fetchDepartments(),
        ]);

        setStats(statsRes.data.stats);
        setDepartments(deptRes.data.data || []);

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-white text-lg">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Welcome to </span>
            <span className="text-red-500">Admin Dashboard</span>
          </h1>
          <p className="text-white/70 mt-1">
            System overview & administrative controls
          </p>
        </div>
        <div className="text-right text-sm text-white/70">
          <p>{now.toDateString()}</p>
          <p className="text-red-500 font-semibold">{now.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<Users className="text-white" />}
          color="bg-cyan-500/80"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents}
          icon={<GraduationCap className="text-white" />}
          color="bg-blue-500/80"
        />
        <StatCard
          title="Staff"
          value={stats?.totalStaff}
          icon={<UserCheck className="text-white" />}
          color="bg-emerald-500/80"
        />
        <StatCard
          title="Roles"
          value={stats?.totalRoles}
          icon={<Shield className="text-white" />}
          color="bg-purple-500/80"
        />
      </div>

      {/* ================= DEPARTMENTS ================= */}
      <SectionCard title="Department-wise Reports">
        {departments.length === 0 ? (
          <p className="text-white/80">No departments found</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {departments.map((d) => (
              <li
                key={d.id}
                className="flex justify-between items-center p-3 border border-white/10 rounded-xl hover:bg-white/5 transition"
              >
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

    </div>
  );
};

export default AdminDashboard;