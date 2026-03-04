import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Shield,
  Building2,
  BarChart3,
  Bell,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

import logo from "../../assets/zaplogo.png";

const SidebarItem = ({ icon, label, path }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${
          active
            ? "bg-white/10 text-white"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">

      {/* ================= SIDEBAR ================= */}
<aside className="fixed left-0 top-0 h-screen w-[270px] bg-gradient-to-b from-[#071c2f] to-[#04111f] px-6 py-6 flex flex-col border-r border-white/10">
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="RMK ZapOut" className="w-44 object-contain" />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-1">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            path="/admin/dashboard"
          />
          <SidebarItem
            icon={<GraduationCap size={18} />}
            label="Students"
            path="/admin/students"
          />
          <SidebarItem
            icon={<UserCog size={18} />}
            label="Staffs"
            path="/admin/staffs"
          />
          <SidebarItem
            icon={<ClipboardList size={18} />}
            label="Watchman"
            path="/admin/watchman"
          />
          <SidebarItem
            icon={<Building2 size={18} />}
            label="Departments"
            path="/admin/departments"
          />
          <SidebarItem
            icon={<BarChart3 size={18} />}
            label="Reports"
            path="/admin/reports"
          />
          {/* <SidebarItem
            icon={<Bell size={18} />}
            label="Notifications"
            path="/admin/notifications"
          />
          
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            path="/admin/settings"
          /> */}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
<main className="flex-1 ml-[270px] p-6 overflow-y-auto">
          <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
