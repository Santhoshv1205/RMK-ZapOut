import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  QrCode,
  Users,
  LogOut,
  Logs,
} from "lucide-react";

import logo from "../../assets/zaplogo.png";

const SidebarItem = ({ icon, label, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${
          active
            ? "bg-[#52dbff]/15 text-[#52dbff]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const WatchmanLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-[260px] h-screen bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] flex flex-col border-r border-white/10">

        {/* LOGO */}
        <div className="px-6 py-6 mb-10 flex justify-center">
          <img
            src={logo}
            alt="RMK ZapOut"
            className="w-44 object-contain"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto px-3">

          <SidebarItem
            icon={<QrCode size={18} />}
            label="Scan Here"
            active={isActive("/watchman/dashboard")}
            onClick={() => navigate("/watchman/dashboard")}
          />

          <SidebarItem
            icon={<Logs size={18} />}
            label="Logs"
            active={isActive("/watchman/logs")}
            onClick={() => navigate("/watchman/logs")}
          />
             <SidebarItem
            icon={<Home size={18} />}
            label="Profile"
            active={isActive("/watchman/profile")}
            onClick={() => navigate("/watchman/profile")}
          />

          {/* <SidebarItem
            icon={<Users size={18} />}
            label="Students"
            active={isActive("/watchman/students")}
            onClick={() => navigate("/watchman/students")}
          /> */}

        </nav>

        {/* LOGOUT */}
        <div className="px-4 pb-6">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default WatchmanLayout;