import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Printer,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";

import logo from "../../assets/zaplogo.png";

/* ================= SIDEBAR ITEM ================= */
const SidebarItem = ({ icon, label, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${
          active
            ? "bg-[#53cf57]/15 text-[#53cf57]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={active ? "text-[#53cf57]" : "relative"}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

/* ================= DEO LAYOUT ================= */
const DEOLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] px-6 py-6 flex flex-col border-r border-white/10">

        {/* LOGO */}
        <div className="mb-10 flex justify-center">
          <img src={logo} alt="RMK ZapOut" className="w-44 object-contain" />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto">

          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={isActive("/deo/dashboard")}
            onClick={() => navigate("/deo/dashboard")}
          />

          <SidebarItem
            icon={<Printer size={18} />}
            label="Requests"
            active={isActive("/deo/students")}
            onClick={() => navigate("/deo/students")}
          />

          <SidebarItem
            icon={<Users size={18} />}
            label="Students List"
            active={isActive("/deo/print")}
            onClick={() => navigate("/deo/print")}
          />

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
            active={isActive("/deo/profile")}
            onClick={() => navigate("/deo/profile")}
          />

          <SidebarItem
            icon={<HelpCircle size={18} />}
            label="Need Help"
            active={isActive("/deo/need-help")}
onClick={() => navigate("/deo/need-help")}
          />

        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 ml-[260px] overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default DEOLayout;